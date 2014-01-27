/**
 *
 */

package org.nuxeo.est.we;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.DocumentRef;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.api.model.Property;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.ModuleRoot;


/**
 * The root entry for the WebEngine module.
 *
 * @author bjalon
 */
@Path("/init")
@Produces("text/html;charset=UTF-8")
@WebObject(type = "Application")
public class Application extends ModuleRoot {

	private static final Log log = LogFactory.getLog(Application.class);

	@Path("nxid/{id}")
	public Object addPicture(@PathParam("id") String id) throws ClientException {
		CoreSession session = ctx.getCoreSession();

		DocumentRef ref = new IdRef(id);
		if (!session.exists(ref)) {
			return getView("attachmentError").arg("id", id);
		}
		DocumentModel doc = session.getDocument(ref);
		return ctx.newObject("Document", doc);
	}

	@GET
	@Path("nxid-remove/{id}")
	public Object removePicture(@PathParam("id") String id)
			throws ClientException {
		CoreSession session = ctx.getCoreSession();

		DocumentRef ref = new IdRef(id);
		DocumentModel doc = session.getDocument(ref);

		Property p = doc.getProperty("file:content");
		p.remove();

		return getView("deattachmentSucessful").arg("Document", doc);
	}

	@GET
	public Object index(@QueryParam("clean") boolean isDoClean) throws ClientException {
		CoreSession session = ctx.getCoreSession();

		if (isDoClean) {
			DocumentModelList docs = session
					.query("SELECT * FROM Livre");
			for (DocumentModel doc : docs) {
				doc.getProperty("file:content").remove();
				doc.getProperty("file:filename").remove();
				log.error("Document clean : " + doc.getTitle());
				session.saveDocument(doc);
			}
			session.save();
		}

		DocumentModelList docs = session
				.query("SELECT * FROM Livre WHERE file:filename IS NULL");

		if (docs.isEmpty()) {
			return getView("empty");
		} else {
			return getView("index").arg("Document", docs.get(0));
		}
	}
}
