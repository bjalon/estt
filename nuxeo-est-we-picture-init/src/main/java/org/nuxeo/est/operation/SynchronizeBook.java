package org.nuxeo.est.operation;

import java.io.Serializable;

import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentModelList;

@Operation(id = SynchronizeBook.ID, category = Constants.CAT_DOCUMENT, label = "Synchronize Book Info", description = "if new value has been set in the input book against other book with same ISBN, this operation will try to merge informations.")
public class SynchronizeBook {

	public static final String ID = "SynchronizeBook";

	private static final String QUERY_ISBN = "SELECT * FROM Livre WHERE livre:isbn = '%s'";

	public CoreSession session;

	public DocumentModel run(DocumentModel doc) throws ClientException {
		String isbn = (String) doc.getPropertyValue("livre:isbn");
		DocumentModelList relatedDocs = session.query(String.format(QUERY_ISBN,
				isbn));

		String classe = (String) doc.getPropertyValue("livre:classe");
		String trigramme = (String) doc
				.getPropertyValue("livre:trigrammeAuteur");
		Blob icone = (Blob) doc.getPropertyValue("livre:icone");
		String editeur = (String) doc.getPropertyValue("livre:editeur");
		String auteur = (String) doc.getPropertyValue("livre:auteur");
		String titre = (String) doc.getPropertyValue("dc:title");
		String description = (String) doc.getPropertyValue("dc:description");
		String mergedDescription = null;
		for (DocumentModel relatedDoc : relatedDocs) {

			if (classe != null && !classe.isEmpty()) {
				if (!classe.equals(relatedDoc.getPropertyValue("livre:classe"))) {
					throw new ClientException(
							"Class can be changed, please ask to Administrator to manage this book");
				}
			} else {
				classe = (String) relatedDoc.getPropertyValue("livre:classe");
				doc.setPropertyValue("livre:classe", classe);
			}
			if (trigramme != null && !trigramme.isEmpty()) {
				relatedDoc.setPropertyValue("livre:trigrammeAuteur", trigramme);
			} else {
				trigramme = (String) relatedDoc
						.getPropertyValue("livre:trigrammeAuteur");
				doc.setPropertyValue("livre:trigrammeAuteur", trigramme);
			}

			if (icone != null) {
				relatedDoc
						.setPropertyValue("livre:icone", (Serializable) icone);
			} else {
				icone = (Blob) relatedDoc.getPropertyValue("livre:icone");
				doc.setPropertyValue("livre:icone", (Serializable) icone);
			}

			if (editeur != null && !editeur.isEmpty()) {
				relatedDoc.setPropertyValue("livre:editeur", editeur);
			} else {
				editeur = (String) relatedDoc.getPropertyValue("livre:editeur");
				doc.setPropertyValue("livre:editeur", editeur);
			}

			if (auteur != null && !auteur.isEmpty()) {
				relatedDoc.setPropertyValue("livre:auteur", auteur);
			} else {
				auteur = (String) relatedDoc.getPropertyValue("livre:auteur");
				doc.setPropertyValue("livre:auteur", auteur);
			}

			if (titre != null && !titre.isEmpty()) {
				relatedDoc.setPropertyValue("dc:title", titre);
			} else {
				titre = (String) relatedDoc.getTitle();
				doc.setPropertyValue("dc:title", titre);
			}

			if (description != null && !description.isEmpty()) {
				if (mergedDescription == null) {
					String description2 = (String) relatedDoc
							.getPropertyValue("dc:description");
					if (description != null && !description.isEmpty()
							&& description2 != null && !description2.isEmpty()) {
						mergedDescription = description2 + "\n" + description;
					} else {
						if (description == null || description.isEmpty()) {
							mergedDescription = description2;
						} else {
							mergedDescription = description;
						}
					}
					doc.setPropertyValue("dc:description", mergedDescription);
				}
				relatedDoc
						.setPropertyValue("dc:description", mergedDescription);
			} else {
				description = (String) relatedDoc
						.getPropertyValue("dc:description");
				doc.setPropertyValue("dc:description", description);
				mergedDescription = description;
			}
			session.saveDocument(relatedDoc);
		}

		return doc;
	}
}
