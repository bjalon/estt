/**
 * 
 */

package org.nuxeo.est.operation;

import java.io.IOException;
import java.text.ParseException;
import java.util.Calendar;

import org.json.JSONException;
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
public class ResetDocumentTestCase {

	@Inject
	CoreSession session;

	private Calendar cal;

	private StringBlob icone;

	private DocumentModel book;

	private ResetDocument reset;

	@Before
	public void init() throws ClientException, ParseException {
		reset = new ResetDocument();

		cal = DateParser.parse("1997-07-16T19:20:30.045+02:00");
		icone = new StringBlob("Text1");
		book = session.createDocumentModel("Livre");
		book.setPropertyValue("livre:classe", "000");
		book.setPropertyValue("livre:isbn", "1");
		book.setPropertyValue("livre:trigrammeAuteur", "TRI");
		book.setPropertyValue("livre:etat", "Etat 1");
		book.setPropertyValue("livre:icone", icone);
		book.setPropertyValue("livre:editeur", "Editeur 1");
		book.setPropertyValue("livre:dateParution", cal);
		book.setPropertyValue("livre:auteur", "Auteur 1");
		book.setPropertyValue("dc:title", "Titre 1");
		book.setPropertyValue("dc:description", "Description 1");
	}

	@Test
	public void shouldDocumentEmptyAfterOperation() throws ClientException,
			IOException, JSONException {
		reset.run(book);
		
		AssertLivre.assertEquals(book, null, null, null, null, null, null, null, null, null, null);

	}

}
