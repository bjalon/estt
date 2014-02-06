/**
 * 
 */

package org.nuxeo.est.operation;

import junit.framework.Assert;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
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
public class ReferenceGenerationTestCase {

	@Inject
	CoreSession session;

	@Test
	public void shouldGenerateReferences() throws Exception {
		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:classe", "000");
		doc.setPropertyValue("livre:isbn", "1");
		doc = session.createDocument(doc);
		session.save();

		Assert.assertEquals("001",
				doc.getPropertyValue("livre:referenceClasse"));
		Assert.assertEquals("N/A",
				doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals("1", doc.getPropertyValue("livre:referenceISBN"));
		Assert.assertEquals("000-001-1",
				doc.getPropertyValue("livre:etiquetteCote"));
		session.save();

		doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:classe", "000");
		doc.setPropertyValue("livre:isbn", "1");
		doc = session.createDocument(doc);

		Assert.assertEquals("001",
				doc.getPropertyValue("livre:referenceClasse"));
		Assert.assertEquals("N/A",
				doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals("2", doc.getPropertyValue("livre:referenceISBN"));
		Assert.assertEquals("000-001-2",
				doc.getPropertyValue("livre:etiquetteCote"));
	}

	@Test
	public void shouldGenerateReferencesForSubClasse() throws Exception {
		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:classe", "900/910");
		doc.setPropertyValue("livre:isbn", "2");
		doc = session.createDocument(doc);
		session.save();
		
		Assert.assertEquals("001",
				doc.getPropertyValue("livre:referenceClasse"));
		Assert.assertEquals("N/A",
				doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals("1", doc.getPropertyValue("livre:referenceISBN"));
		Assert.assertEquals("910-001-1",
				doc.getPropertyValue("livre:etiquetteCote"));
		session.save();
	}
	
	@Test
	public void shouldGenerateReferencesForSubSubClasse() throws Exception {
		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:classe", "800/840/R 840");
		doc.setPropertyValue("livre:auteur", "hUgo victor");
		doc.setPropertyValue("livre:isbn", "3");
		doc = session.createDocument(doc);
		session.save();
		
		Assert.assertEquals("001",
				doc.getPropertyValue("livre:referenceClasse"));
		Assert.assertEquals("1", doc.getPropertyValue("livre:referenceISBN"));
		Assert.assertEquals("HUG", doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals("R 840-HUG-001-1",
				doc.getPropertyValue("livre:etiquetteCote"));
		session.save();
	}

	@Test
	public void shouldGenerateReferencesForSubSubClasseAndTrigrammeAuthorSet() throws Exception {
		DocumentModel doc = session.createDocumentModel("Livre");
		doc.setPropertyValue("livre:classe", "800/840/C 840");
		doc.setPropertyValue("livre:auteur", "Victor Hugo");
		doc.setPropertyValue("livre:trigrammeAuteur", "HUG");
		doc.setPropertyValue("livre:isbn", "4");
		doc = session.createDocument(doc);
		session.save();
		
		Assert.assertEquals("001",
				doc.getPropertyValue("livre:referenceClasse"));
		Assert.assertEquals("1", doc.getPropertyValue("livre:referenceISBN"));
		Assert.assertEquals("HUG", doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals("C 840-HUG-001-1",
				doc.getPropertyValue("livre:etiquetteCote"));
		session.save();
	}

}
