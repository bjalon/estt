package org.nuxeo.est.operation;

import java.io.IOException;
import java.util.Map;

import org.json.JSONException;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Context;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.annotations.Param;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.ClientException;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.model.PropertyException;

@Operation(id = ResetOperation.ID, category = Constants.CAT_DOCUMENT, label = "Reset Document", description = "")
public class ResetOperation {

	public static final String ID = "ResetDocument";

	// private static final Log log = LogFactory.getLog(InitFromISBN.class);

	@Context
	protected OperationContext ctx;

	@Param(name = "isbn")
	protected String isbn;

	@OperationMethod(collector = DocumentModelCollector.class)
	public DocumentModel run(DocumentModel input) throws IOException,
			JSONException, PropertyException, ClientException {

		for (String schema : input.getSchemas()) {
			Map<String, Object> properties = input.getProperties(schema);
			for (String field : input.getProperties(schema).keySet()) {
				properties.put(field, null);
			}
			input.setProperties(schema, properties);
		}
		return input;
	}

}
