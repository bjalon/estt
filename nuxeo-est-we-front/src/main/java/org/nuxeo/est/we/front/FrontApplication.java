/**
 *
 */

package org.nuxeo.est.we.front;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.model.PropertyException;
import org.nuxeo.ecm.platform.usermanager.UserManager;
import org.nuxeo.ecm.user.center.profile.UserProfileService;
import org.nuxeo.ecm.webengine.model.WebObject;
import org.nuxeo.ecm.webengine.model.impl.ModuleRoot;
import org.nuxeo.runtime.api.Framework;

/**
 * The root entry for the WebEngine module.
 * 
 * @author bjalon
 */
@Path("/front")
@Produces("text/html;charset=UTF-8")
@WebObject(type = "FrontApplication")
public class FrontApplication extends ModuleRoot {

	private static final Log log = LogFactory.getLog(FrontApplication.class);

	private UserProfileService userProfileService;

	private AutomationService automationService;

	private UserManager userManager;

	@GET
	@Path("livre/{id}")
	@Produces("text/json; charset=UTF-8")
	public Object getLivre(@PathParam("id") String id) throws ClientException {
		CoreSession session = ctx.getCoreSession();
		String query = String
				.format("SELECT * FROM Livre WHERE ecm:isProxy = 0 AND ecm:isVersion = 0 AND livre:etiquetteCote = '%s' AND ecm:currentLifeCycleState = 'disponible'",
						id);
		DocumentModelList docs = session.query(query);

		if (docs.size() != 1) {
			log.error("Can't find book available for this reference: " + id);
			return null;
		}

		DocumentModel livre = docs.get(0);
		Map<String, Object> map = livre.getProperties("livre");
		map.putAll(livre.getProperties("dublincore"));
		map.put("ecm:uuid", livre.getId());
		map.put("ecm:path", livre.getPathAsString());
		map.put("file:filename", livre.getPropertyValue("file:filename"));
		if (livre.getPropertyValue("file:filename") != null){
			String jaquetteURL = "/nuxeo/nxfile/default/" + livre.getId() + "/blobholder:0/" + livre.getPropertyValue("file:filename");
			map.put("jaquetteURL", jaquetteURL);
		}
		JSONObject json = new JSONObject(map);
		
		return json.toString();
	}

	@GET
	@Path("eleve/{id}")
	@Produces("text/json; charset=UTF-8")
	public Object getEleve(@PathParam("id") String username)
			throws ClientException {
		return getEleveAsJSONFromUsername(username).toString();
	}

	private JSONObject getEleveAsJSONFromUsername(String username)
			throws ClientException, PropertyException {
		CoreSession session = ctx.getCoreSession();

		UserManager um = getUserManager();
		DocumentModel user = um.getUserModel(username);

		JSONObject json = getEleveAsJSON(session, user);

		return json;
	}

	private JSONObject getEleveAsJSON(CoreSession session, DocumentModel user)
			throws ClientException, PropertyException {
		UserProfileService ups = getUserProfileService();
		DocumentModel userProfile = ups.getUserProfileDocument(
				(String) user.getPropertyValue("username"), session);

		Map<String, Object> map = user.getProperties("user");
		map.put("ecm:uuid", userProfile.getId());
		map.put("ecm:path", userProfile.getPathAsString());
		Blob avatar = ((Blob) userProfile
				.getPropertyValue("userprofile:avatar"));
		if (avatar != null) {
			map.put("file:filename", avatar.getFilename());
			map.put("photoURL", "/nuxeo/nxfile/default/" + userProfile.getId()
					+ "/userprofile:avatar/" + avatar.getFilename());
		}
		JSONObject json = new JSONObject(map);
		return json;
	}

	@GET
	@Path("search/eleve/{usernameCriteria}/{groupName}")
	@Produces("text/json; charset=UTF-8")
	public Object getSearchEleveInGroup(
			@PathParam("usernameCriteria") String usernameCriteria,
			@PathParam("groupName") String groupName) throws ClientException {
		CoreSession session = ctx.getCoreSession();
		UserManager um = getUserManager();

		Map<String, Serializable> filter = new HashMap<String, Serializable>();
		filter.put("company", groupName);

		DocumentModelList users = um.searchUsers(filter,
				Collections.singleton(usernameCriteria));

		JSONArray json = new JSONArray();
		for (DocumentModel user : users) {
			json.put(getEleveAsJSON(session, user));
		}
		return json.toString();
	}

	@GET
	@Path("search/eleve/{usernameCriteria}")
	@Produces("text/json; charset=UTF-8")
	public Object getSearchEleveInGroup(
			@PathParam("usernameCriteria") String usernameCriteria)
			throws ClientException {
		CoreSession session = ctx.getCoreSession();
		UserManager um = getUserManager();

		DocumentModelList users = um.searchUsers(usernameCriteria);

		JSONArray json = new JSONArray();
		for (DocumentModel user : users) {
			json.put(getEleveAsJSON(session, user));
		}
		return json.toString();
	}

	protected UserProfileService getUserProfileService() throws ClientException {
		if (userProfileService == null) {
			try {
				userProfileService = Framework
						.getService(UserProfileService.class);
			} catch (Exception e) {
				throw new ClientException("Failed to get UserProfileService", e);
			}
		}
		return userProfileService;
	}

	protected AutomationService getAutomationService() throws ClientException {
		if (automationService == null) {
			try {
				automationService = Framework
						.getService(AutomationService.class);
			} catch (Exception e) {
				throw new ClientException("Failed to get AutomationService", e);
			}
		}
		return automationService;
	}

	protected UserManager getUserManager() throws ClientException {
		if (userManager == null) {
			try {
				userManager = Framework.getService(UserManager.class);
			} catch (Exception e) {
				throw new ClientException("Failed to get UserManager", e);
			}
		}
		return userManager;
	}

}
