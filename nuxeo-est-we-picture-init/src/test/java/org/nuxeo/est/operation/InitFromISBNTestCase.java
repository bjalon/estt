/**
 * 
 */

package org.nuxeo.est.operation;

import java.io.IOException;

import junit.framework.Assert;

import org.json.JSONException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.ClientException;
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
@Deploy({ "nuxeo-est-webengine", "studio.extensions.gestion-bibliotheque-ecole-sainte-therese" })
public class InitFromISBNTestCase {

	@Inject
	CoreSession coreSession;

	private DocumentModel doc;

	private InitFromISBN operation;

	@Before
	public void init() throws ClientException {
		doc = coreSession.createDocumentModel("File");

		operation = new InitFromISBN();
		operation.ctx = new OperationContext(coreSession);
	}

	@Test
	public void shouldGetBookTitle() throws ClientException, IOException, JSONException {
		operation.save = false;
		operation.isbn = "2-03870217-9";
		
		operation.run(doc);
		Assert.assertEquals("L'araignée-crabe", doc.getTitle());
	}

}
