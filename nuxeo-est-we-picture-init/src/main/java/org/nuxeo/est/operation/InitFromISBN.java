/**
 * 
 */

package org.nuxeo.est.operation;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Calendar;

import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.model.PropertyException;

import sun.net.www.protocol.http.HttpURLConnection;

/**
 * @author bjalon
 */
@Operation(id = InitFromISBN.ID, category = Constants.CAT_DOCUMENT, label = "Init Document From ISBN", description = "")
public class InitFromISBN {

	public static final String ID = "InitFromISBN";

	private static final String QUERY_ISBN = "SELECT * FROM Livre WHERE livre:isbn = '%s'";

	private static final Log log = LogFactory.getLog(InitFromISBN.class);

	@Context
	protected OperationContext ctx;

	@Param(name = "isbn")
	protected String isbn;

	@Param(name = "save")
	protected boolean save;

	private JSONObject bookInfo;

	@OperationMethod(collector = DocumentModelCollector.class)
	public DocumentModel run(DocumentModel input) throws IOException,
			JSONException, PropertyException, ClientException {
		
		
		CoreSession session = ctx.getCoreSession();
				
		DocumentModel doc = input;
		String isbn = (String) doc.getPropertyValue("livre:isbn");
		DocumentModelList relatedDocs = session.query(String.format(QUERY_ISBN,
				isbn));

		if (relatedDocs.size() > 0) {

			String classe = (String) relatedDocs.get(0).getPropertyValue(
					"livre:classe");
			String trigramme = (String) relatedDocs.get(0).getPropertyValue(
					"livre:trigrammeAuteur");
			Blob icone = (Blob) relatedDocs.get(0).getPropertyValue(
					"livre:icone");
			String editeur = (String) relatedDocs.get(0).getPropertyValue(
					"livre:editeur");
			String auteur = (String) relatedDocs.get(0).getPropertyValue(
					"livre:auteur");
			Calendar dateParution = (Calendar) relatedDocs.get(0)
					.getPropertyValue("livre:dateParution");
			String titre = (String) relatedDocs.get(0).getPropertyValue(
					"dc:title");
			String description = (String) relatedDocs.get(0).getPropertyValue(
					"dc:description");

			doc.setPropertyValue("livre:classe", classe);
			doc.setPropertyValue("livre:trigrammeAuteur", trigramme);
			doc.setPropertyValue("livre:icone", (Serializable) icone);
			doc.setPropertyValue("livre:editeur", editeur);
			doc.setPropertyValue("livre:auteur", auteur);
			doc.setPropertyValue("livre:dateParution", dateParution);
			doc.setPropertyValue("dc:title", titre);
			doc.setPropertyValue("dc:description", description);
			return doc;
		}
		
		fetchBookFromGoogle();
		fetchBookFromOpenLibrary();

		updateFromBookInfo(input);

		if (save) {
			if (input.getRef() != null && session.exists(input.getRef())) {
				session.saveDocument(input);
			} else {
				session.createDocument(input);
			}
			session.save();
		}

		return input;
	}

	private void fetchBookFromGoogle() throws MalformedURLException,
			IOException, JSONException {
		String isbnNormalized = isbn.replaceAll("[_-]", "");
		URL url = new URL("https://www.googleapis.com/books/v1/volumes?q=isbn:"
				+ isbnNormalized);
		InputStream is = url.openConnection().getInputStream();

		bookInfo = new JSONObject(inputStreamToString(is))
				.getJSONArray("items").getJSONObject(0);

	}

	
    public static final String QUERY_ISBN_URL = "http://openlibrary.org/api/books?bibkeys=%s&format=json";
    
	private void fetchBookFromOpenLibrary(
			) throws MalformedURLException,
			IOException, JSONException, ClientException {
        String isbn = "ISBN:".concat(this.isbn.replaceAll("[_-]", ""));
        String query = String.format(QUERY_ISBN_URL, isbn);
        URL url = new URL(query);
        HttpURLConnection urlConnection = null;
        try {
            urlConnection = (HttpURLConnection) url.openConnection();
            BufferedReader in = new BufferedReader(new InputStreamReader(
                    urlConnection.getInputStream()));
            StringBuffer sb = new StringBuffer();
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                sb.append(inputLine);
            }
            JSONObject jso = new JSONObject(sb.toString());
            if (!jso.has(isbn)) {
            	log.error("Open Library return nothing about " + isbn);
            	return;
            }
            JSONObject metadata = jso.getJSONObject(isbn);
            String bib_key = metadata.getString("bib_key");
            if (bib_key != null) {
            	System.out.println(" :" + bib_key);
//                input.setPropertyValue("isbn:bib_key", bib_key);
            }
            String info_url = metadata.getString("info_url");
            if (info_url != null) {
            	System.out.println(" :" + info_url);
//                input.setPropertyValue("isbn:info_url", info_url);
            }
            String preview = metadata.getString("preview");
            if (preview != null) {
            	System.out.println(" :" + preview);
//                input.setPropertyValue("isbn:preview", preview);
            }
            String preview_url = metadata.getString("preview_url");
            if (preview_url != null) {
            	System.out.println(" :" + preview_url);
//                input.setPropertyValue("isbn:preview_url", preview_url);
            }
            String thumbnail_url = metadata.getString("thumbnail_url");
            if (thumbnail_url != null) {
            	System.out.println(" :" + thumbnail_url);
//                input.setPropertyValue("isbn:thumbnail_url", thumbnail_url);
            }
            in.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (urlConnection != null) {
                urlConnection.disconnect();
            }
        }
	}

	private void updateFromBookInfo(DocumentModel doc) throws JSONException,
			PropertyException, ClientException {
		JSONObject volInfo = bookInfo.getJSONObject("volumeInfo");

		if (volInfo.getString("title") != null) {
			doc.setPropertyValue("dc:title", volInfo.getString("title"));
		}
		if (volInfo.getJSONArray("authors") != null) {
			doc.setPropertyValue("livre:auteur", volInfo
					.getJSONArray("authors").join(","));
		}

	}

	private String inputStreamToString(InputStream is) throws IOException {
		StringWriter writer = new StringWriter();
		IOUtils.copy(is, writer, "UTF-8");
		return writer.toString();
	}
}
