/**
 * 
 */

package org.nuxeo.est.operation;

import java.io.IOException;
import java.net.UnknownHostException;
import java.text.ParseException;
import java.util.Calendar;

import junit.framework.Assert;

import org.json.JSONException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.client.model.DateParser;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.impl.blob.StringBlob;
import org.nuxeo.runtime.test.runner.Deploy;
import org.nuxeo.runtime.test.runner.Features;
import org.nuxeo.runtime.test.runner.FeaturesRunner;

import com.google.inject.Inject;

/**
 * @author bjalon
 */

@RunWith(FeaturesRunner.class)
@Features(AutomationFeature.class)
@Deploy({ "org.nuxeo.ecm.platform.uidgen.core",
	"org.nuxeo.ecm.core.persistence",
	"nuxeo-est-webengine-test:uid-gen-test.xml",
	"nuxeo-est-webengine-test:before-studio.xml",
	"nuxeo-est-webengine-test:before-studio2.xml",
	"studio.extensions.gestion-bibliotheque-ecole-sainte-therese",
	"nuxeo-est-webengine" })

public class InitFromISBNTestCase {

	@Inject
	CoreSession session;

	private DocumentModel doc;

	private InitFromISBN operation;

	private Calendar cal;

	private Calendar cal2;

	private StringBlob icone;

	private DocumentModel book1;

	private DocumentModel book2;

	private StringBlob icone2;

	@Before
	public void init() throws ClientException, ParseException {
		doc = session.createDocumentModel("Livre");

		operation = new InitFromISBN();
		operation.ctx = new OperationContext(session);

		cal = DateParser.parse("1997-07-16T19:20:30.045+02:00");
		cal2 = DateParser.parse("1997-07-17T19:20:30.045+02:00");
		icone = new StringBlob("Text1");
		icone2 = new StringBlob("Text2");

		book1 = session.createDocumentModel("Livre");
		book1.setPropertyValue("livre:classe", "000");
		book1.setPropertyValue("livre:isbn", "1");
		book1.setPropertyValue("livre:trigrammeAuteur", "TRI");
		book1.setPropertyValue("livre:etat", "Etat 1");
		book1.setPropertyValue("livre:icone", icone);
		book1.setPropertyValue("livre:editeur", "Editeur 1");
		book1.setPropertyValue("livre:dateParution", cal);
		book1.setPropertyValue("livre:auteur", "Auteur 1");
		book1.setPropertyValue("dc:title", "Titre 1");
		book1.setPropertyValue("dc:description", "Description 1");
		book1 = session.createDocument(book1);

		book2 = session.createDocumentModel("Livre");
		book2.setPropertyValue("livre:classe", "000");
		book2.setPropertyValue("livre:isbn", "1");
		book2.setPropertyValue("livre:trigrammeAuteur", "TRI");
		book2.setPropertyValue("livre:icone", icone);
		book2.setPropertyValue("livre:etat", "Etat 1");
		book2.setPropertyValue("livre:editeur", "Editeur 1");
		book2.setPropertyValue("livre:auteur", "Auteur 1");
		book2.setPropertyValue("livre:dateParution", cal);
		book2.setPropertyValue("dc:title", "Titre 1");
		book2.setPropertyValue("dc:description", "Description 1");
		book2 = session.createDocument(book2);
		session.save();
	}

	@Test
	public void shouldGetBookTitleIfUnknowBook() throws ClientException, IOException,
			JSONException {
		operation.save = false;
		operation.isbn = "2-03870217-9";


		try {
			operation.run(doc);
			Assert.assertEquals("L'araignée-crabe", doc.getTitle());
		} catch(UnknownHostException e) {
			System.out.println("Can't execute test as google unreachable");
		}
	}

	@Test
	public void shouldCopyMetadataIfBookKnown() throws Exception {

		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:isbn", "1");
		doc = operation.run(doc);

		AssertLivre.assertEquals(doc, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, null, "Editeur 1", "Auteur 1", cal);
	}

	@Test
	public void shouldOverrideMetadataIfBookKnown()
			throws Exception {

		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:isbn", "1");
		doc.setPropertyValue("livre:classe", "010");
		doc.setPropertyValue("livre:trigrammeAuteur", "TRA");
		doc.setPropertyValue("livre:etat", "Etat 2");
		doc.setPropertyValue("livre:icone", icone2);
		doc.setPropertyValue("livre:editeur", "Editeur 2");
		doc.setPropertyValue("livre:dateParution", cal2);
		doc.setPropertyValue("livre:auteur", "Auteur 2");
		doc.setPropertyValue("dc:title", "Titre 2");
		doc.setPropertyValue("dc:description", "Description 2");
		doc = operation.run(doc);

		AssertLivre.assertEquals(doc, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, "Etat 2", "Editeur 1", "Auteur 1", cal);

		book1 = session.getDocument(book1.getRef());
		book2 = session.getDocument(book2.getRef());

		AssertLivre.assertEquals(book1, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, "Etat 1", "Editeur 1", "Auteur 1", cal);

		AssertLivre.assertEquals(book2, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, "Etat 1", "Editeur 1", "Auteur 1", cal);
	}

}
