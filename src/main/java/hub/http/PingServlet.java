package hub.http;

import org.apache.camel.CamelContext;
import org.apache.camel.CamelExecutionException;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.cdi.ContextName;

import javax.inject.Inject;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

@WebServlet(name = "PingServlet", urlPatterns = {"/ping"}, loadOnStartup = 1)
public class PingServlet extends HttpServlet {

    @Inject
    @ContextName("cdi-context")
    private CamelContext context;

    private static final Logger LOGGER = Logger.getLogger(PingServlet.class.getName());

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) {
        try {
            ProducerTemplate producer = context.createProducerTemplate();
            String result = producer.requestBody("direct:ping", null, String.class);
            LOGGER.log(Level.INFO, result);
            ServletOutputStream out = res.getOutputStream();
            out.print(result);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, e.getMessage());
        }
        catch (CamelExecutionException camelException) {
            LOGGER.log(Level.SEVERE, camelException.getMessage());
        }
    }
}