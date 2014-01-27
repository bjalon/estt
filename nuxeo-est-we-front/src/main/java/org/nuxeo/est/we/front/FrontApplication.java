/**
 *
 */

package org.nuxeo.est.we.front;

import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.json.JSONObject;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.platform.usermanager.UserManager;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.ModuleRoot;
import org.nuxeo.runtime.api.Framework;


/**
 * The root entry for the WebEngine module.
 * @author bjalon
 */
@Path("/front")
@Produces("text/html;charset=UTF-8")
@WebObject(type="FrontApplication")
public class FrontApplication extends ModuleRoot {

    @GET
    public Object doGet() {
        return getView("emprunt");
    }

    @GET
    @Path("livre/{id}")
    @Produces("text/json; charset=UTF-8")
    public Object getLivre(@PathParam("id") String id) throws ClientException {
    	CoreSession session = ctx.getCoreSession();
    	String query = String.format("SELECT * FROM Livre WHERE ecm:isProxy = 0 AND ecm:isVersion = 0 AND livre:reference = '%s'", id);
    	DocumentModelList docs = session.query(query);
    	
    	if (docs.size() != 1) {
    		return null;
    	}
    	
    	DocumentModel livre = docs.get(0);
		Map<String, Object> map = livre.getProperties("livre");
    	map.putAll(livre.getProperties("dublincore"));
    	map.put("ecm:uuid", livre.getId());
    	map.put("ecm:path", livre.getPathAsString());
    	map.put("file:filename", livre.getPropertyValue("file:filename"));
    	JSONObject json = new JSONObject(map);
    	
        return json.toString();
    }


    @GET
    @Path("eleve/{id}")
    @Produces("text/json; charset=UTF-8")
    public Object getEleve(@PathParam("id") String username) throws ClientException {
    	CoreSession session = ctx.getCoreSession();
    	String query = String.format("SELECT * FROM UserProfile WHERE ecm:isProxy = 0 AND ecm:isVersion = 0 AND dc:creator = '%s'", username);
    	DocumentModelList docs = session.query(query);
    	
    	if (docs.size() != 1) {
    		return null;
    	}
    	UserManager service = Framework.getLocalService(UserManager.class);
    	DocumentModel user = service.getUserModel(username);
    	
    	DocumentModel userProfile = docs.get(0);
		Map<String, Object> map = user.getProperties("user");
    	map.put("ecm:uuid", userProfile.getId());
    	map.put("ecm:path", userProfile.getPathAsString());
    	map.put("file:filename", ((Blob)userProfile.getPropertyValue("userprofile:avatar")).getFilename());
    	JSONObject json = new JSONObject(map);
    	
        return json.toString();
    }

}
