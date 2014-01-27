/**
 * 
 */

package org.nuxeo.est.operation;

import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;

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
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.model.PropertyException;
import org.nuxeo.ecm.platform.usermanager.UserManager;

/**
 * @author bjalon
 */
@Operation(id = InitFromISBN.ID, category = Constants.CAT_DOCUMENT, label = "Init Document From ISBN", description = "")
public class InitFromISBN {

	public static final String ID = "InitFromISBN";

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
		fetchBook();

		updateFromBookInfo(input);

		if (save) {
			CoreSession session = ctx.getCoreSession();
			if (input.getRef() != null && session.exists(input.getRef())) {
				session.saveDocument(input);
			} else {
				session.createDocument(input);
			}
			session.save();
		}

		return input;
	}

	private void fetchBook() throws MalformedURLException, IOException,
			JSONException {
		String isbnNormalized = isbn.replaceAll("[_-]", "");
		URL url = new URL("https://www.googleapis.com/books/v1/volumes?q=isbn:"
				+ isbnNormalized);
		InputStream is = url.openConnection().getInputStream();

		bookInfo = new JSONObject(inputStreamToString(is))
				.getJSONArray("items").getJSONObject(0);

	}

	private void updateFromBookInfo(DocumentModel doc) throws JSONException, PropertyException, ClientException {
		JSONObject volInfo = bookInfo.getJSONObject("volumeInfo");

		if (volInfo.getString("title") != null) {
			doc.setPropertyValue("dc:title", volInfo.getString("title"));
		}
		if (volInfo.getJSONArray("authors") != null) {
			doc.setPropertyValue("livre:auteur", volInfo.getJSONArray("authors").join(","));
		}

	}

	private String inputStreamToString(InputStream is) throws IOException {
		StringWriter writer = new StringWriter();
		IOUtils.copy(is, writer, "UTF-8");
		return writer.toString();
	}
}
