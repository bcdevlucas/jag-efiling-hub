package hub;

import hub.helper.Environment;
import hub.helper.Stringify;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.logging.Logger;

@Named
public class CsoSaveFiling {

    private static final Logger LOGGER = Logger.getLogger(CsoSaveFiling.class.getName());

    @Inject
    Environment environment;

    @Inject
    Stringify stringify;

    @Inject
    XmlExtractor extract;

    public String user() {
        return environment.getValue("CSO_USER");
    }

    public String password() {
        return environment.getValue("CSO_PASSWORD");
    }

    public String basicAuthorization() {
        return "Basic " + Base64.getEncoder().encodeToString(
                (this.user() + ":" + this.password()).getBytes());
    }

    public String endpoint() {
        return environment.getValue("CSO_EXTENSION_ENDPOINT");
    }

    public String soapAction() {
        return environment.getValue("CSO_SAVE_FILING_SOAP_ACTION");
    }

    public String message(String userguid, String invoiceNumber, String data) throws IOException {
        ClassLoader classLoader = getClass().getClassLoader();
        InputStream inputStream = classLoader.getResourceAsStream("templates/cso-save-filing.xml");
        String template = stringify.inputStream(inputStream);

        JSONObject jo = new JSONObject(data);
        String courtFileNumber = (String) jo.get(("formSevenNumber"));

        String partyTemplate = extract.outerTag("party", template);
        String parties = buildParties(jo, partyTemplate);

        return template
                .replace("<userguid>?</userguid>", "<userguid>"+userguid+"</userguid>")
                .replace("<bcolUserId>?</bcolUserId>", "<bcolUserId></bcolUserId>")
                .replace("<bcolSessionKey>?</bcolSessionKey>", "<bcolSessionKey></bcolSessionKey>")
                .replace("<bcolUniqueId>?</bcolUniqueId>", "<bcolUniqueId></bcolUniqueId>")

                .replace("<cfcsa>?</cfcsa>", "<cfcsa></cfcsa>")
                .replace("<classCd>?</classCd>", "<classCd></classCd>")
                .replace("<clientRefNo>?</clientRefNo>", "<clientRefNo></clientRefNo>")
                .replace("<comments>?</comments>", "<comments></comments>")
                .replace("<courtFileNumber>?</courtFileNumber>", "<courtFileNumber>"+courtFileNumber+"</courtFileNumber>")
                .replace("<divisionCd>?</divisionCd>", "<divisionCd></divisionCd>")

                .replace("<existingFile>?</existingFile>", "<existingFile></existingFile>")
                .replace("<indigent>?</indigent>", "<indigent></indigent>")
                .replace("<invoiceNo>?</invoiceNo>", "<invoiceNo>"+invoiceNumber+"</invoiceNo>")
                .replace("<levelCd>?</levelCd>", "<levelCd></levelCd>")
                .replace("<locationCd>?</locationCd>", "<locationCd></locationCd>")
                .replace("<notificationEmail>?</notificationEmail>", "<notificationEmail></notificationEmail>")
                .replace("<eNotification>?</eNotification>", "<eNotification></eNotification>")
                .replace("<por>?</por>", "<por></por>")
                .replace("<prevFileNumber>?</prevFileNumber>", "<prevFileNumber></prevFileNumber>")
                .replace("<processingComplete>?</processingComplete>", "<processingComplete></processingComplete>")
                .replace("<resubmission>?</resubmission>", "<resubmission></resubmission>")
                .replace("<rush>?</rush>", "<rush></rush>")
                .replace("<serviceId>?</serviceId>", "<serviceId></serviceId>")
                .replace("<submittedDtm>?</submittedDtm>", "<submittedDtm></submittedDtm>")

                .replace("<documentType>?</documentType>", "<documentType></documentType>")
                .replace("<filename>?</filename>", "<filename>form2.pdf</filename>")
                .replace("<initiatingYn>?</initiatingYn>", "<initiatingYn>N</initiatingYn>")
                .replace("<orderDocument>?</orderDocument>", "<orderDocument></orderDocument>")

                .replace(partyTemplate, parties)

                .replace("<accountId>?</accountId>", "<accountId></accountId>")
                .replace("<clientId>?</clientId>", "<clientId></clientId>")
                .replace("<privilegeCd>?</privilegeCd>", "<privilegeCd></privilegeCd>")
                ;
    }

    private String buildParties(JSONObject jo, String partyTemplate) {
        String parties = "";
        parties = addContribution(partyTemplate, parties, (JSONArray) jo.get("appellants"));
        parties = addContribution(partyTemplate, parties, (JSONArray) jo.get("respondents"));

        return parties;
    }

    private String addContribution(String partyTemplate, String parties, JSONArray collection) {
        for (int i = 0; i < collection.length(); i++) {
            JSONObject party = (JSONObject) collection.get(i);
            String contribution = new String(partyTemplate);
            contribution = contribution
                    .replace("<firstGivenName>?</firstGivenName>", "<firstGivenName>" + party.get("name") + "</firstGivenName>")
                    .replace("<organizationName>?</organizationName>", "<organizationName></organizationName>")
                    .replace("<partyType>?</partyType>", "<partyType></partyType>")
                    .replace("<roleType>?</roleType>", "<roleType></roleType>")
                    .replace("<secondGivenName>?</secondGivenName>", "<secondGivenName></secondGivenName>")
                    .replace("<surnameName>?</surnameName>", "<surnameName></surnameName>")
                    .replace("<thirdGivenName>?</thirdGivenName>", "<thirdGivenName></thirdGivenName>")
            ;
            parties += contribution;
        }
        return parties;
    }
}
