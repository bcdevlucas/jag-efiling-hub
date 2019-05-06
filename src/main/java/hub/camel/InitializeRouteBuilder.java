package hub.camel;

import hub.ORInitialize;
import org.apache.camel.Exchange;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.cdi.ContextName;

import javax.ejb.Startup;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import java.util.logging.Level;
import java.util.logging.Logger;


@ApplicationScoped
@Startup
@ContextName("cdi-context")
public class InitializeRouteBuilder extends RouteBuilder {

    @Inject
    ORInitialize orInitialize;

    private static final Logger LOGGER = Logger.getLogger(InitializeRouteBuilder.class.getName());

    @Override
    public void configure() {

        from("direct:initialize")
            .onException(Exception.class)
                .handled(true)
                .process(exchange -> {
                    Exception exception = (Exception) exchange.getProperty(Exchange.EXCEPTION_CAUGHT);
                    LOGGER.log(Level.WARNING, exception.getMessage(), exception);
                })
                .setBody(constant("SERVICE UNAVAILABLE"))
            .end()
            .process(exchange -> LOGGER.log(Level.INFO, "initialize call..."))
            .process(exchange -> {
                String message = "" +
                        "{" +
                        "   \"AppId\":\"" + orInitialize.application() + "\"," +
                        "   \"AppPwd\":\"" + orInitialize.password() + "\"," +
                        "   \"TicketLifeTime\":\"120\"" +
                        "}";
                LOGGER.log(Level.INFO, "message="+message);
                exchange.getOut().setBody(message);
            })
            .setHeader(Exchange.HTTP_METHOD, constant("POST"))
            .setHeader(Exchange.CONTENT_TYPE, constant("application/json"))
            .to(orInitialize.orEndpoint())
            .process(exchange -> {
                String answer = exchange.getIn().getBody(String.class);
                LOGGER.log(Level.INFO, "answer initialize="+answer);

                exchange.getOut().setBody(answer);
            });
    }
}