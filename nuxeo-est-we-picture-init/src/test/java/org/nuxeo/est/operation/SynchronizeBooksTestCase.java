/**
 * 
 */

package org.nuxeo.est.operation;

import java.text.ParseException;
import java.util.Calendar;

import junit.framework.Assert;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
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
public class SynchronizeBooksTestCase {

	@Inject
	CoreSession session;
	private SynchronizeBook operation;
	private Calendar cal;
	private StringBlob icone;
	private StringBlob icone2;
	private Calendar cal2;
	private DocumentModel book1;
	private DocumentModel book2;
	private int isbnRefLast;

	@Before
	public void init() throws ParseException, ClientException {
		operation = new SynchronizeBook();
		operation.session = session;

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
		isbnRefLast = Integer.parseInt((String) book2
				.getPropertyValue("livre:referenceISBN"));

	}

	@Test
	public void shouldGetExistingBookValueIfNotSet() throws Exception {

		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:isbn", "1");
		doc = operation.run(doc);
		session.save();

		AssertLivre.assertEquals(doc, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, null, "Editeur 1", "Auteur 1", null);

		book1 = session.getDocument(book1.getRef());
		book2 = session.getDocument(book2.getRef());

		AssertLivre.assertEquals(book1, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, "Etat 1", "Editeur 1", "Auteur 1", cal);

		AssertLivre.assertEquals(book2, "1", "Titre 1", "Description 1", "000",
				"TRI", icone, "Etat 1", "Editeur 1", "Auteur 1", cal);

	}

	@Test
	public void shouldOverrideIfValueSet() throws Exception {

		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:isbn", "1");
		doc.setPropertyValue("livre:etat", "Etat 2");
		doc.setPropertyValue("dc:title", "Titre 2");
		doc.setPropertyValue("livre:icone", icone2);
		doc.setPropertyValue("livre:dateParution", cal2);
		doc.setPropertyValue("livre:editeur", "Editeur 2");
		doc.setPropertyValue("livre:auteur", "Auteur 2");
		doc.setPropertyValue("livre:trigrammeAuteur", "TRA");
		doc.setPropertyValue("dc:description", "Description 2");
		doc = operation.run(doc);
		session.createDocument(doc);
		session.save();

		AssertLivre.assertEquals(doc, "1", "Titre 2",
				"Description 1\nDescription 2", "000", "TRA", icone2, "Etat 2",
				"Editeur 2", "Auteur 2", cal2);
		Assert.assertEquals("000-001-" + (isbnRefLast + 1),
				doc.getPropertyValue("livre:etiquetteCote"));

		book1 = session.getDocument(book1.getRef());
		book2 = session.getDocument(book2.getRef());

		AssertLivre.assertEquals(book1, "1", "Titre 2",
				"Description 1\nDescription 2", "000", "TRA", icone2, "Etat 1",
				"Editeur 2", "Auteur 2", cal);

		AssertLivre.assertEquals(book2, "1", "Titre 2",
				"Description 1\nDescription 2", "000", "TRA", icone2, "Etat 1",
				"Editeur 2", "Auteur 2", cal);

	}

	@Test
	public void shouldMergeFail() throws Exception {

		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:isbn", "1");
		doc.setPropertyValue("livre:classe", "010");
		try {
			doc = operation.run(doc);
			Assert.fail("should failed as classe has changed");
		} catch (ClientException e) {
			Assert.assertEquals(
					"Class can be changed, please ask to Administrator to manage this book",
					e.getMessage());
		}

	}

}
