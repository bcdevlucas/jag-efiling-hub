package hub.camel;

import hub.CsoSaveFiling;
import hub.WebcatsUpdate;
import hub.XmlExtractor;
import hub.helper.Stringify;
import org.apache.camel.Exchange;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.cdi.ContextName;
import org.apache.camel.dataformat.xmljson.XmlJsonDataFormat;
import org.json.JSONObject;

import javax.ejb.Startup;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.logging.Level;
import java.util.logging.Logger;


@ApplicationScoped
@Startup
@ContextName("cdi-context")
public class CsoSaveFilingRouteBuilder extends RouteBuilder {

    private static final Logger LOGGER = Logger.getLogger(CsoSaveFilingRouteBuilder.class.getName());

    @Inject
    CsoSaveFiling csoSaveFiling;

    @Inject
    XmlExtractor extract;

    @Override
    public void configure() {

        from("direct:csoSaveFiling")
            .onException(Exception.class)
                .handled(true)
                .process(exchange -> {
                    Exception exception = (Exception) exchange.getProperty(Exchange.EXCEPTION_CAUGHT);
                    LOGGER.log(Level.WARNING, exception.getMessage(), exception);
                })
                .setBody(constant("SERVICE UNAVAILABLE"))
            .end()
            .process(exchange -> LOGGER.log(Level.INFO, "update call..."))
            .process(exchange -> {
                String userguid = (String) exchange.getProperties().get("userguid");
                String invoiceNumber = (String) exchange.getProperties().get("invoiceNumber");
                String data = (String) exchange.getProperties().get("data");
                LOGGER.log(Level.INFO, "data="+data);

                String message = csoSaveFiling.message(userguid, invoiceNumber, data);
                LOGGER.log(Level.INFO, "cso save filing message="+message);
                exchange.getOut().setBody(message);
            })
            .setHeader(Exchange.HTTP_METHOD, constant("POST"))
            .setHeader(Exchange.CONTENT_TYPE, constant("text/xml"))
            .setHeader("Authorization", constant(csoSaveFiling.basicAuthorization()))
            .setHeader("SOAPAction", constant(csoSaveFiling.soapAction()))
            .to(csoSaveFiling.endpoint())
            .process(exchange -> {
                String answer = exchange.getIn().getBody(String.class);
                LOGGER.log(Level.INFO, "answer of cso update="+answer);

                exchange.getProperties().put("packageNumber", extract.valueFromTag("packageNumber", answer));
            })
        ;
    }
}
