package org.nuxeo.est.operation;

import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;
import org.nuxeo.ecm.core.api.model.PropertyException;
import org.nuxeo.ecm.platform.uidgen.UIDSequencer;
import org.nuxeo.runtime.api.Framework;

@Operation(id = EtiquetteCoteGeneration.ID, category = Constants.CAT_DOCUMENT, label = "Genere Etiquette côté", description = "")
public class EtiquetteCoteGeneration {

	private static final String QUERY_ISBN = "SELECT * FROM Livre WHERE livre:isbn = '%s'";

	public static final String ID = "ReferenceGeneration";

	// private static final Log log = LogFactory
	// .getLog(EtiquetteCoteGeneration.class);

	@Context
	protected OperationContext ctx;

	// @Param(name = "isbn")
	// protected String isbn;
	//
	// @Param(name = "save")
	// protected boolean save;

	@OperationMethod(collector = DocumentModelCollector.class)
	public DocumentModel run(DocumentModel input) throws Exception {
		CoreSession session = ctx.getCoreSession();

		String isbn = (String) input.getPropertyValue("livre:isbn");
		String classe = getClasse(input);
		getTrigrammeAuteur(input);

		DocumentModelList docs = session.query(String.format(QUERY_ISBN, isbn));

		String refISBN = getNextId((String) input
				.getPropertyValue("livre:isbn"));
		String refClasse;

		// already a book with this isbn in library
		if (docs.size() > 0) {
			refClasse = (String) docs.get(0).getPropertyValue(
					"livre:referenceClasse");
		} else {
			String id = getNextId(getClasse(input));
			refClasse = formatWithSize(id, 3);
		}

		String etiquetteCote = classe + "-" + refClasse + "-" + refISBN;

		input.setPropertyValue("livre:referenceClasse", refClasse);
		input.setPropertyValue("livre:referenceISBN", refISBN);
		input.setPropertyValue("livre:etiquetteCote", etiquetteCote);

		return input;
	}

	private String getTrigrammeAuteur(DocumentModel input)
			throws ClientException {
		String auteur = (String) input
				.getPropertyValue("livre:trigrammeAuteur");
		if (auteur != null && !auteur.isEmpty()) {
			return auteur;
		}

		auteur = (String) input.getPropertyValue("livre:auteur");
		if (auteur != null && !auteur.isEmpty()) {
			auteur = auteur.trim().replace(" ", "");
			auteur = auteur.substring(0, 3);
			auteur = auteur.toUpperCase();
		} else {
			auteur = "N/A";
		}

		input.setPropertyValue("livre:trigrammeAuteur", auteur);
		return auteur;
	}

	private String getClasse(DocumentModel input) throws PropertyException,
			ClientException {
		String result = (String) input.getPropertyValue("livre:classe");
		if (result.contains("/")) {
			result = result.substring(result.lastIndexOf('/') + 1);
		}
		if (result.matches("^[a-zA-Z].*")) {
			result = result + "-" + getTrigrammeAuteur(input);
		}
		return result;
	}

	private String formatWithSize(String id, int i) {
		String format = String.format("%%0%sd", i);
		int value = Integer.parseInt(id);
		return String.format(format, value);
	}

	public String getNextId(String key) throws Exception {
		UIDSequencer svc = Framework.getService(UIDSequencer.class);
		return Integer.toString(svc.getNext(key));
	}

	public static void main(String[] args) {
		System.out.println(true);
		System.out.println("a 3434".matches("^[a-zA-Z].*"));
		System.out.println("B 234".matches("^[a-zA-Z].*"));
		System.out.println("1234".matches("^[a-zA-Z].*"));
	}
}
