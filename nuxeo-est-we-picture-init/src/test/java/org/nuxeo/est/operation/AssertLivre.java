package org.nuxeo.est.operation;

import java.io.IOException;
import java.util.Calendar;

import junit.framework.Assert;

import org.nuxeo.ecm.core.api.Blob;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.model.PropertyException;

public class AssertLivre {

	public static void assertEquals(DocumentModel doc, String isbn, String title,
			String description, String classe, String trigramme, Blob icone,
			String etat, String editeur, String auteur, Calendar dateParution)
			throws PropertyException, ClientException, IOException {
		Assert.assertEquals(isbn, doc.getPropertyValue("livre:isbn"));
		Assert.assertEquals(title, doc.getPropertyValue("dc:title"));
		Assert.assertEquals(classe, doc.getPropertyValue("livre:classe"));
		Assert.assertEquals(trigramme,
				doc.getPropertyValue("livre:trigrammeAuteur"));
		Assert.assertEquals(icone.getString(),
				((Blob) doc.getPropertyValue("livre:icone")).getString());
		Assert.assertEquals(etat, doc.getPropertyValue("livre:etat"));
		Assert.assertEquals(editeur, doc.getPropertyValue("livre:editeur"));
		Assert.assertEquals(auteur, doc.getPropertyValue("livre:auteur"));
		Assert.assertEquals(dateParution,
				doc.getPropertyValue("livre:dateParution"));
		Assert.assertEquals(description, doc.getPropertyValue("dc:description"));
	}

}
