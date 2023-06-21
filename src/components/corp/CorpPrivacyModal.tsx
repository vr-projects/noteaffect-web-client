import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import GenericModal from 'components/controls/GenericModal';

interface ICorpPrivacyModalProps {
  show: boolean;
  onClose: () => void;
}

interface ICorpPrivacyModalState {}

class CorpPrivacyModal extends SrUiComponent<
  ICorpPrivacyModalProps,
  ICorpPrivacyModalState
> {
  handleClose() {
    this.props.onClose();
  }

  performRender() {
    const { show } = this.props;

    return (
      <GenericModal
        bodyClassName="corp-privacy-modal"
        modalTitle={Localizer.get('NoteAffect Privacy Policy')}
        show={show}
        size={'lg'}
        onCloseClicked={() => this.handleClose()}
      >
        <p>Privacy Policy</p>
        <p>Last updated: October 19, 2020</p>
        <p>
          This Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your information when You use the
          Service and tells You about Your privacy rights and how the law
          protects You. We use Your Personal data to provide and improve the
          Service. By using the Service, You agree to the collection and use of
          information in accordance with this Privacy Policy.
        </p>
        <h1 id="interpretation-and-definitions">
          Interpretation and Definitions
        </h1>
        <h2 id="interpretation">Interpretation</h2>
        <p>
          The words of which the initial letter is capitalized have meanings as
          defined in this Policy and under the following conditions. The
          following definitions shall have the same meaning regardless of
          whether they appear in singular or in plural.
        </p>
        <h2 id="definitions">Definitions</h2>
        <p>For the purposes of this Privacy Policy:</p>
        <p>
          <strong>Account</strong> means a unique account created for You to
          access our Service or parts of our Service.
        </p>
        <p>
          <strong>Affiliate</strong> means an entity that controls, is
          controlled by or is under common control with a party, where
          &quot;control&quot; means ownership of 50% or more of the shares,
          equity interest or other securities entitled to vote for election of
          directors or other managing authority.
        </p>
        <p>
          <strong>Application</strong> means the software program provided by
          the Company downloaded by You on any electronic device, named
          Meeting-Master
        </p>
        <p>
          <strong>Business</strong> , for the purpose of the CCPA (California
          Consumer Privacy Act), refers to the Company as the legal entity that
          collects Consumers&#39; personal information and determines the
          purposes and means of the processing of Consumers&#39; personal
          information, or on behalf of which such information is collected and
          that alone, or jointly with others, determines the purposes and means
          of the processing of consumers&#39; personal information, that does
          business in the State of California.
        </p>
        <p>
          <strong>Company</strong> (referred to as either &quot;the
          Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in
          this Agreement) refers to NoteAffect LLC, 1290 Bay Dale Dr #324,
          Arnold MD 21012.
        </p>
        <p>For the purpose of the GDPR, the Company is the Data Controller.</p>
        <p>
          <strong>Consumer</strong> , for the purpose of the CCPA (California
          Consumer Privacy Act), means a natural person who is a California
          resident. A resident, as defined in the law, includes (1) every
          individual who is in the USA for other than a temporary or transitory
          purpose, and (2) every individual who is domiciled in the USA who is
          outside the USA for a temporary or transitory purpose.
        </p>
        <p>
          <strong>Cookies</strong> are small files that are placed on Your
          computer, mobile device or any other device by a website, containing
          the details of Your browsing history on that website among its many
          uses.
        </p>
        <p>
          <strong>Country</strong> refers to: Maryland, United States
        </p>
        <p>
          <strong>Data Controller</strong> , for the purposes of the GDPR
          (General Data Protection Regulation), refers to the Company as the
          legal person which alone or jointly with others determines the
          purposes and means of the processing of Personal Data.
        </p>
        <p>
          <strong>Device</strong> means any device that can access the Service
          such as a computer, a cellphone or a digital tablet.
        </p>
        <p>
          <strong>Do Not Track</strong> (DNT) is a concept that has been
          promoted by US regulatory authorities, in particular the U.S. Federal
          Trade Commission (FTC), for the Internet industry to develop and
          implement a mechanism for allowing internet users to control the
          tracking of their online activities across websites.
        </p>
        <p>
          <strong>Personal Data</strong> is any information that relates to an
          identified or identifiable individual.
        </p>
        <p>
          For the purposes for GDPR, Personal Data means any information
          relating to You such as a name, an identification number, location
          data, online identifier or to one or more factors specific to the
          physical, physiological, genetic, mental, economic, cultural or social
          identity.
        </p>
        <p>
          For the purposes of the CCPA, Personal Data means any information that
          identifies, relates to, describes or is capable of being associated
          with, or could reasonably be linked, directly or indirectly, with You.
        </p>
        <p>
          <strong>Sale</strong> , for the purpose of the CCPA (California
          Consumer Privacy Act), means selling, renting, releasing, disclosing,
          disseminating, making available, transferring, or otherwise
          communicating orally, in writing, or by electronic or other means, a
          Consumer&#39;s personal information to another business or a third
          party for monetary or other valuable consideration.
        </p>
        <p>
          <strong>Service</strong> refers to the Application or the Website or
          both.
        </p>
        <p>
          <strong>Service Provider</strong> means any natural or legal person
          who processes the data on behalf of the Company. It refers to
          third-party companies or individuals employed by the Company to
          facilitate the Service, to provide the Service on behalf of the
          Company, to perform services related to the Service or to assist the
          Company in analyzing how the Service is used. For the purpose of the
          GDPR, Service Providers are considered Data Processors.
        </p>
        <p>
          <strong>Third-party Social Media Service</strong> refers to any
          website or any social network website through which a User can log in
          or create an account to use the Service.
        </p>
        <p>
          <strong>Usage Data</strong> refers to data collected automatically,
          either generated by the use of the Service or from the Service
          infrastructure itself (for example, the duration of a page visit).
        </p>
        <p>
          <strong>Website</strong> refers to NoteAffect.com, accessible from the
          following link:
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="http://www.noteaffect.com/"
          >
            http://www.noteaffect.com
          </a>
          .
        </p>
        <p>
          <strong>You</strong> means the individual accessing or using the
          Service, or the company, or other legal entity on behalf of which such
          individual is accessing or using the Service, as applicable.
        </p>
        <p>
          Under GDPR (General Data Protection Regulation), You can be referred
          to as the Data Subject or as the User as you are the individual using
          the Service.
        </p>
        <h1 id="collecting-and-using-your-personal-data">
          Collecting and Using Your Personal Data
        </h1>
        <h2 id="types-of-data-collected">Types of Data Collected</h2>
        <h3 id="personal-data">Personal Data</h3>
        <p>
          While using Our Service, We may ask You to provide Us with certain
          personally identifiable information that can be used to contact or
          identify You. Personally identifiable information may include, but is
          not limited to:
        </p>
        <p>Email address</p>
        <p>First name and last name</p>
        <p>Usage Data</p>
        <p>Transactional Data</p>
        <p>Content Data</p>
        <h3 id="usage-data">Usage Data</h3>
        <p>Usage Data is collected automatically when using the Service.</p>
        <p>
          Usage Data may include information such as Your Device&#39;s Internet
          Protocol address (e.g. IP address), browser type, browser version, the
          pages of our Service that You visit, the time and date of Your visit,
          the time spent on those pages, unique device identifiers and other
          diagnostic data.
        </p>
        <p>
          When You access the Service by or through a mobile device, We may
          collect certain information automatically, including, but not limited
          to, the type of mobile device You use, Your mobile device unique ID,
          the IP address of Your mobile device, Your mobile operating system,
          the type of mobile Internet browser You use, unique device identifiers
          and other diagnostic data.
        </p>
        <p>
          We may also collect information that Your browser sends whenever You
          visit our Service or when You access the Service by or through a
          mobile device.
        </p>
        <p>
          Additionally, we may collect precise geolocation information that you
          allow our apps to access (usually from your mobile device)
        </p>
        <h3 id="transactional-data">Transactional Data</h3>
        <p>
          Transactional data, such as: names and email addresses of parties to a
          transaction, subject line, history of actions that individuals take on
          a transaction(e.g. review, sign, enable features) and personal
          information about those individuals or their devices, such as name,
          email address, IP address, and authentication method.
        </p>
        <h3 id="content-data">Content Data</h3>
        <p>
          Content data, such as: notes, highlights, annotations, questions,
          answers to polling questions, and other data the user chooses to add
          to their content in their account. Content data is only shared with
          other users if You allow this data to be shared. NoteAffect does not
          share this data with anyone. Analytics and statically data is derived
          from the Content data by NoteAffect to be used only for statistical
          purposes. Content data, such as: notes, highlights, annotations, is
          not disclosed to anyone else without your permission.
        </p>
        <h3 id="tracking-technologies-and-cookies">
          Tracking Technologies and Cookies
        </h3>
        <p>
          We use Cookies and similar tracking technologies to track the activity
          on Our Service and store certain information. Tracking technologies
          used are beacons, tags, and scripts to collect and track information
          and to improve and analyze Our Service. The technologies We use may
          include:
        </p>
        <ul>
          <li>
            <strong>Cookies or Browser Cookies.</strong> A cookie is a small
            file placed on Your Device. You can instruct Your browser to refuse
            all Cookies or to indicate when a Cookie is being sent. However, if
            You do not accept Cookies, You may not be able to use some parts of
            our Service. Unless you have adjusted Your browser setting so that
            it will refuse Cookies, our Service may use Cookies.
          </li>
          <li>
            <strong>Flash Cookies.</strong> Certain features of our Service may
            use local stored objects (or Flash Cookies) to collect and store
            information about Your preferences or Your activity on our Service.
            Flash Cookies are not managed by the same browser settings as those
            used for Browser Cookies. For more information on how You can delete
            Flash Cookies, please read &quot;Where can I change the settings for
            disabling, or deleting local shared objects?&quot; available at the
            following link:
            <br />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html#main_Where_can_I_change_the_settings_for_disabling__or_deleting_local_shared_objects_"
            >
              https://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html#main_Where_can_I_change_the_settings_for_disabling__or_deleting_local_shared_objects_
            </a>
          </li>
          <li>
            <strong>Web Beacons.</strong> Certain sections of our Service and
            our emails may contain small electronic files known as web beacons
            (also referred to as clear gifs, pixel tags, and single-pixel gifs)
            that permit the Company, for example, to count users who have
            visited those pages or opened an email and for other related website
            statistics (for example, recording the popularity of a certain
            section and verifying system and server integrity).
          </li>
        </ul>
        <p>
          Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies.
          Persistent Cookies remain on Your personal computer or mobile device
          when You go offline, while Session Cookies are deleted as soon as You
          close Your web browser. Learn more about cookies at the following
          links:
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.freeprivacypolicy.com/blog/cookies/"
          >
            Cookies: What Do They Do?
          </a>
          <br />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.webopedia.com/insights/all-about-cookies/"
          >
            What Are Cookies And What Do Cookies Do?
          </a>
          .
        </p>
        <p>
          We use both Session and Persistent Cookies for the purposes set out
          below:
        </p>
        <p>
          <strong>Necessary / Essential Cookies</strong>
        </p>
        <p>Type: Session Cookies</p>
        <p>Administered by: Us</p>
        <p>
          Purpose: These Cookies are essential to provide You with services
          available through the Website and to enable You to use some of its
          features. They help to authenticate users and prevent fraudulent use
          of user accounts. Without these Cookies, the services that You have
          asked for cannot be provided, and We only use these Cookies to provide
          You with those services.
        </p>
        <p>
          <strong>Cookies Policy / Notice Acceptance Cookies</strong>
        </p>
        <p>Type: Persistent Cookies</p>
        <p>Administered by: Us</p>
        <p>
          Purpose: These Cookies identify if users have accepted the use of
          cookies on the Website.
        </p>
        <p>
          <strong>Functionality Cookies</strong>
        </p>
        <p>Type: Persistent Cookies</p>
        <p>Administered by: Us</p>
        <p>
          Purpose: These Cookies allow Us to remember choices You make when You
          use the Website, such as remembering your login details or language
          preference. The purpose of these Cookies is to provide You with a more
          personal experience and to avoid You having to re-enter your
          preferences every time You use the Website.
        </p>
        <p>
          For more information about the Cookies we use and your choices
          regarding Cookies, please visit our Cookies Policy or the Cookies
          section of our Privacy Policy.
        </p>
        <h2 id="use-of-your-personal-data">Use of Your Personal Data</h2>
        <p>The Company may use Personal Data for the following purposes:</p>
        <p>
          <strong>To provide and maintain our Service</strong> , including to
          monitor the usage of our Service.
        </p>
        <p>
          <strong>To manage Your Account:</strong> to manage Your registration
          as a user of the Service. The Personal Data You provide can give You
          access to different functionalities of the Service that are available
          to You as a registered user.
        </p>
        <p>
          <strong>For the performance of a contract:</strong> to carry out the
          development, compliance and undertaking of the Company&#39;s duties
          and obligations of the purchase contract for the products, items or
          services You have purchased or of any other contract with Us through
          the Service.
        </p>
        <p>
          <strong>To contact You:</strong> To contact You by email, telephone
          calls, SMS, or other equivalent forms of electronic communication,
          such as a mobile application&#39;s push notifications regarding
          updates or informative communications related to the functionalities,
          products or contracted services, including the security updates, when
          necessary or reasonable for their implementation, or in response to
          Your request for contact.
        </p>
        <p>
          <strong>To provide You</strong> with news, special offers and general
          information about other goods, services and events which we offer that
          are similar to those that you have already purchased or inquired about
          unless You have opted not to receive such information.
        </p>
        <p>
          <strong>To manage Your requests:</strong> To attend and manage Your
          requests to Us.
        </p>
        <p>
          <strong>For business transfers:</strong> We may use Your information
          to evaluate or conduct a merger, divestiture, restructuring,
          reorganization, dissolution, or other sale or transfer of some or all
          of Our assets, whether as a going concern or as part of bankruptcy,
          liquidation, or similar proceeding, in which Personal Data held by Us
          about our Service users is among the assets transferred.
        </p>
        <p>
          <strong>For other purposes</strong> : We may use Your information for
          other purposes, such as data analysis, identifying usage trends,
          determining the effectiveness of our promotional campaigns and to
          evaluate and improve our Service, products, services, marketing and
          your experience.
        </p>
        <p>
          We may share Your personal information in the following situations:
        </p>
        <ul>
          <li>
            <strong>With Service Providers:</strong> We may share Your personal
            information with Service Providers to monitor and analyze the use of
            our Service, to contact You.
          </li>
          <li>
            <strong>For business transfers:</strong> We may share or transfer
            Your personal information in connection with, or during negotiations
            of, any merger, sale of Company assets, financing, or acquisition of
            all or a portion of Our business by another company.
          </li>
          <li>
            <strong>With Affiliates:</strong> We may share Your information with
            Our affiliates, in which case we will require those affiliates to
            honor this Privacy Policy. Affiliates include Our parent company and
            any other subsidiaries, joint venture partners or other companies
            that We control or that are under common control with Us.
          </li>
          <li>
            <strong>With business partners:</strong> We may share Your
            information with Our business partners to offer You certain
            products, services or promotions.
          </li>
          <li>
            <strong>With other users:</strong> when You share personal
            information or otherwise interact in the public areas with other
            users, such information may be viewed by all users and may be
            publicly distributed outside. If You interact with other users or
            register through a Third-Party Social Media Service, Your contacts
            on the Third-Party Social Media Service may see Your name, profile,
            pictures and description of Your activity. Similarly, other users
            will be able to view descriptions of Your activity, communicate with
            You and view Your profile.
          </li>
          <li>
            <strong>With Your consent</strong> : We may disclose Your personal
            information for any other purpose with Your consent.
          </li>
        </ul>
        <h2 id="retention-of-your-personal-data">
          Retention of Your Personal Data
        </h2>
        <p>
          The Company will retain Your Personal Data only for as long as is
          necessary for the purposes set out in this Privacy Policy. We will
          retain and use Your Personal Data to the extent necessary to comply
          with our legal obligations (for example, if we are required to retain
          your data to comply with applicable laws), resolve disputes, and
          enforce our legal agreements and policies.
        </p>
        <p>
          The Company will also retain Usage Data for internal analysis
          purposes. Usage Data is generally retained for a shorter period of
          time, except when this data is used to strengthen the security or to
          improve the functionality of Our Service, or We are legally obligated
          to retain this data for longer time periods.
        </p>
        <h2 id="transfer-of-your-personal-data">
          Transfer of Your Personal Data
        </h2>
        <p>
          Your information, including Personal Data, is processed at the
          Company&#39;s operating offices and in any other places where the
          parties involved in the processing are located. This means that Your
          information may be transferred to — and maintained on — computers
          located outside of Your state, province, country or other governmental
          jurisdiction where the data protection laws may differ from those in
          Your jurisdiction.
        </p>
        <p>
          Your consent to this Privacy Policy followed by Your submission of
          such information represents Your agreement to that transfer.
        </p>
        <p>
          The Company will take all steps reasonably necessary to ensure that
          Your data is treated securely and in accordance with this Privacy
          Policy and no transfer of Your Personal Data will take place to an
          organization or a country unless there are adequate controls in place
          including the security of Your data and other personal information.
        </p>
        <h2 id="disclosure-of-your-personal-data">
          Disclosure of Your Personal Data
        </h2>
        <h3 id="business-transactions">Business Transactions</h3>
        <p>
          If the Company is involved in a merger, acquisition or asset sale,
          Your Personal Data may be transferred. We will provide notice before
          Your Personal Data is transferred and becomes subject to a different
          Privacy Policy.
        </p>
        <h3 id="law-enforcement">Law enforcement</h3>
        <p>
          Under certain circumstances, the Company may be required to disclose
          Your Personal Data if required to do so by law or in response to valid
          requests by public authorities (e.g. a court or a government agency).
        </p>
        <h3 id="other-legal-requirements">Other legal requirements</h3>
        <p>
          The Company may disclose Your Personal Data in the good faith belief
          that such action is necessary to:
        </p>
        <ul>
          <li>Comply with a legal obligation</li>
          <li>Protect and defend the rights or property of the Company</li>
          <li>
            Prevent or investigate possible wrongdoing in connection with the
            Service
          </li>
          <li>
            Protect the personal safety of Users of the Service or the public
          </li>
          <li>Protect against legal liability</li>
        </ul>
        <h2 id="security-of-your-personal-data">
          Security of Your Personal Data
        </h2>
        <p>
          The security of Your Personal Data is important to Us, but remember
          that no method of transmission over the Internet, or method of
          electronic storage is 100% secure. While We strive to use commercially
          acceptable means to protect Your Personal Data, We cannot guarantee
          its absolute security.
        </p>
        <h1 id="gdpr-privacy">GDPR Privacy</h1>
        <h2 id="legal-basis-for-processing-personal-data-under-gdpr">
          Legal Basis for Processing Personal Data under GDPR
        </h2>
        <p>We may process Personal Data under the following conditions:</p>
        <ul>
          <li>
            <strong>Consent:</strong> You have given Your consent for processing
            Personal Data for one or more specific purposes.
          </li>
          <li>
            <strong>Performance of a contract:</strong> Provision of Personal
            Data is necessary for the performance of an agreement with You
            and/or for any pre-contractual obligations thereof.
          </li>
          <li>
            <strong>Legal obligations:</strong> Processing Personal Data is
            necessary for compliance with a legal obligation to which the
            Company is subject.
          </li>
          <li>
            <strong>Vital interests:</strong> Processing Personal Data is
            necessary in order to protect Your vital interests or of another
            natural person.
          </li>
          <li>
            <strong>Public interests:</strong> Processing Personal Data is
            related to a task that is carried out in the public interest or in
            the exercise of official authority vested in the Company.
          </li>
          <li>
            <strong>Legitimate interests:</strong> Processing Personal Data is
            necessary for the purposes of the legitimate interests pursued by
            the Company.
          </li>
        </ul>
        <p>
          In any case, the Company will gladly help to clarify the specific
          legal basis that applies to the processing, and in particular whether
          the provision of Personal Data is a statutory or contractual
          requirement, or a requirement necessary to enter into a contract.
        </p>
        <h2 id="your-rights-under-the-gdpr">Your Rights under the GDPR</h2>
        <p>
          The Company undertakes to respect the confidentiality of Your Personal
          Data and to guarantee You can exercise Your rights.
        </p>
        <p>
          You have the right under this Privacy Policy, and by law if You are
          within the EU, to:
        </p>
        <ul>
          <li>
            <strong>Request access to Your Personal Data.</strong> The right to
            access, update or delete the information We have on You. Whenever
            made possible, You can access, update or request deletion of Your
            Personal Data directly within Your account settings section. If You
            are unable to perform these actions Yourself, please contact Us to
            assist You. This also enables You to receive a copy of the Personal
            Data We hold about You.
          </li>
          <li>
            <strong>
              Request correction of the Personal Data that We hold about You.
            </strong>
            You have the right to to have any incomplete or inaccurate
            information We hold about You corrected.
          </li>
          <li>
            <strong>Object to processing of Your Personal Data.</strong> This
            right exists whenever We are relying on a legitimate interest as the
            legal basis for Our processing and there is something about Your
            particular situation, which makes You want to object to our
            processing of Your Personal Data on this ground. You also have the
            right to object whenever We are processing Your Personal Data for
            direct marketing purposes.
          </li>
          <li>
            <strong>Request erasure of Your Personal Data.</strong> You have the
            right to ask Us to delete or remove Personal Data when there is no
            good reason for Us to continue processing it.
          </li>
          <li>
            <strong>Request the transfer of Your Personal Data.</strong> We will
            provide to You, or to a third-party You have chosen, Your Personal
            Data in a structured, commonly used, machine-readable format. Please
            note that this right only applies to automated information which You
            initially provided consent for Us to use or where We used the
            information to perform a contract with You.
          </li>
          <li>
            <strong>Withdraw Your consent.</strong> You have the right to
            withdraw Your consent on using your Personal Data. If You withdraw
            Your consent, We may not be able to provide You with access to
            certain specific functionalities of the Service.
          </li>
        </ul>
        <h2 id="exercising-of-your-gdpr-data-protection-rights">
          Exercising of Your GDPR Data Protection Rights
        </h2>
        <p>
          You may exercise Your rights of access, rectification, cancellation
          and opposition by contacting Us. Please note that we may ask You to
          verify Your identity before responding to such requests. If You make a
          request, We will try our best to respond to You as soon as possible.
        </p>
        <p>
          You have the right to complain to a Data Protection Authority about
          Our collection and use of Your Personal Data. For more information, if
          You are in the European Economic Area (EEA), please contact Your local
          data protection authority in the EEA.
        </p>
        <h1 id="ccpa-privacy">CCPA Privacy</h1>
        <p>
          This privacy notice section for California residents supplements the
          information contained in Our Privacy Policy and it applies solely to
          all visitors, users, and others who reside in the State of California.
        </p>
        <h2 id="categories-of-personal-information-collected">
          Categories of Personal Information Collected
        </h2>
        <p>
          We collect information that identifies, relates to, describes,
          references, is capable of being associated with, or could reasonably
          be linked, directly or indirectly, with a particular Consumer or
          Device. The following is a list of categories of personal information
          which we may collect or may have been collected from California
          residents within the last twelve (12) months.
        </p>
        <p>
          Please note that the categories and examples provided in the list
          below are those defined in the CCPA. This does not mean that all
          examples of that category of personal information were in fact
          collected by Us, but reflects our good faith belief to the best of our
          knowledge that some of that information from the applicable category
          may be and may have been collected. For example, certain categories of
          personal information would only be collected if You provided such
          personal information directly to Us.
        </p>
        <p>
          <strong>Category A: Identifiers.</strong>
        </p>
        <p>
          Examples: A real name, alias, postal address, unique personal
          identifier, online identifier, Internet Protocol address, email
          address, account name, driver&#39;s license number, passport number,
          or other similar identifiers.
        </p>
        <p>Collected: Yes.</p>
        <p>
          <strong>
            Category B: Personal information categories listed in the California
            Customer Records statute (Cal. Civ. Code § 1798.80(e)).
          </strong>
        </p>
        <p>
          Examples: A name, signature, Social Security number, physical
          characteristics or description, address, telephone number, passport
          number, driver&#39;s license or state identification card number,
          insurance policy number, education, employment, employment history,
          bank account number, credit card number, debit card number, or any
          other financial information, medical information, or health insurance
          information. Some personal information included in this category may
          overlap with other categories.
        </p>
        <p>Collected: Yes.</p>
        <p>
          <strong>
            Category C: Protected classification characteristics under
            California or federal law.
          </strong>
        </p>
        <p>
          Examples: Age (40 years or older), race, color, ancestry, national
          origin, citizenship, religion or creed, marital status, medical
          condition, physical or mental disability, sex (including gender,
          gender identity, gender expression, pregnancy or childbirth and
          related medical conditions), sexual orientation, veteran or military
          status, genetic information (including familial genetic information).
        </p>
        <p>Collected: No.</p>
        <p>
          <strong>Category D: Commercial information.</strong>
        </p>
        <p>
          Examples: Records and history of products or services purchased or
          considered.
        </p>
        <p>Collected: No.</p>
        <p>
          <strong>Category E: Biometric information.</strong>
        </p>
        <p>
          Examples: Genetic, physiological, behavioral, and biological
          characteristics, or activity patterns used to extract a template or
          other identifier or identifying information, such as, fingerprints,
          faceprints, and voiceprints, iris or retina scans, keystroke, gait, or
          other physical patterns, and sleep, health, or exercise data.
        </p>
        <p>Collected: No.</p>
        <p>
          <strong>
            Category F: Internet or other similar network activity.
          </strong>
        </p>
        <p>Examples: Interaction with our Service or advertisement.</p>
        <p>Collected: Yes.</p>
        <p>
          <strong>Category G: Geolocation data.</strong>
        </p>
        <p>Examples: Approximate physical location.</p>
        <p>Collected: No.</p>
        <p>
          <strong>Category H: Sensory data.</strong>
        </p>
        <p>
          Examples: Audio, electronic, visual, thermal, olfactory, or similar
          information.
        </p>
        <p>Collected: No.</p>
        <p>
          <strong>
            Category I: Professional or employment-related information.
          </strong>
        </p>
        <p>Examples: Current or past job history or performance evaluations.</p>
        <p>Collected: No.</p>
        <p>
          <strong>
            Category J: Non-public education information (per the Family
            Educational Rights and Privacy Act (20 U.S.C. Section 1232g, 34
            C.F.R. Part 99)).
          </strong>
        </p>
        <p>
          Examples: Education records directly related to a student created or
          maintained by an educational institution or party acting on its
          behalf, such as grades, transcripts, class lists, student schedules,
          student identification codes, student financial information, or
          student disciplinary records.
        </p>
        <p>Collected: No.</p>
        <p>
          <strong>
            Category K: Inferences drawn from other personal information.
          </strong>
        </p>
        <p>
          Examples: Profile reflecting a person&#39;s preferences,
          characteristics, psychological trends, predispositions, behavior,
          attitudes, intelligence, abilities, and aptitudes.
        </p>
        <p>Collected: No.</p>
        <p>Under CCPA, personal information does not include:</p>
        <ul>
          <li>Publicly available information from government records</li>
          <li>Deidentified or aggregated consumer information</li>
          <li>
            <p>Information excluded from the CCPA&#39;s scope, such as:</p>
          </li>
          <li>
            <p>
              Health or medical information covered by the Health Insurance
              Portability and Accountability Act of 1996 (HIPAA) and the
              California Confidentiality of Medical Information Act (CMIA) or
              clinical trial data
            </p>
          </li>
          <li>
            Personal Information covered by certain sector-specific privacy
            laws, including the Fair Credit Reporting Act (FRCA), the
            Gramm-Leach-Bliley Act (GLBA) or California Financial Information
            Privacy Act (FIPA), and the Driver&#39;s Privacy Protection Act of
            1994
          </li>
        </ul>
        <h2 id="sources-of-personal-information">
          Sources of Personal Information
        </h2>
        <p>
          We obtain the categories of personal information listed above from the
          following categories of sources:
        </p>
        <ul>
          <li>
            <strong>Directly from You</strong>. For example, from the forms You
            complete on our Service, preferences You express or provide through
            our Service.
          </li>
          <li>
            <strong>Indirectly from You</strong>. For example, from observing
            Your activity on our Service.
          </li>
          <li>
            <strong>Automatically from You</strong>. For example, through
            cookies We or our Service Providers set on Your Device as You
            navigate through our Service.
          </li>
          <li>
            <strong>From Service Providers</strong>. For example, or other
            third-party vendors that We use to provide the Service to You.
          </li>
        </ul>
        <h2 id="use-of-personal-information-for-business-purposes-or-commercial-purposes">
          Use of Personal Information for Business Purposes or Commercial
          Purposes
        </h2>
        <p>
          We may use or disclose personal information We collect for
          &quot;business purposes&quot; or &quot;commercial purposes&quot; (as
          defined under the CCPA), which may include the following examples:
        </p>
        <ul>
          <li>To operate our Service and provide You with our Service.</li>
          <li>
            To provide You with support and to respond to Your inquiries,
            including to investigate and address Your concerns and monitor and
            improve our Service.
          </li>
          <li>
            To fulfill or meet the reason You provided the information. For
            example, if You share Your contact information to ask a question
            about our Service, We will use that personal information to respond
            to Your inquiry.
          </li>
          <li>
            To respond to law enforcement requests and as required by applicable
            law, court order, or governmental regulations.
          </li>
          <li>
            As described to You when collecting Your personal information or as
            otherwise set forth in the CCPA.
          </li>
          <li>For internal administrative and auditing purposes.</li>
          <li>
            To detect security incidents and protect against malicious,
            deceptive, fraudulent or illegal activity, including, when
            necessary, to prosecute those responsible for such activities.
          </li>
        </ul>
        <p>
          Please note that the examples provided above are illustrative and not
          intended to be exhaustive. For more details on how we use this
          information, please refer to the &quot;Use of Your Personal Data&quot;
          section.
        </p>
        <p>
          If We decide to collect additional categories of personal information
          or use the personal information We collected for materially different,
          unrelated, or incompatible purposes We will update this Privacy
          Policy.
        </p>
        <h2 id="disclosure-of-personal-information-for-business-purposes-or-commercial-purposes">
          Disclosure of Personal Information for Business Purposes or Commercial
          Purposes
        </h2>
        <p>
          We may use or disclose and may have used or disclosed in the last
          twelve (12) months the following categories of personal information
          for business or commercial purposes:
        </p>
        <p>Category A: Identifiers</p>
        <p>
          Category B: Personal information categories listed in the California
          Customer Records statute (Cal. Civ. Code § 1798.80(e))
        </p>
        <p>Category F: Internet or other similar network activity</p>
        <p>
          Please note that the categories listed above are those defined in the
          CCPA. This does not mean that all examples of that category of
          personal information were in fact disclosed, but reflects our good
          faith belief to the best of our knowledge that some of that
          information from the applicable category may be and may have been
          disclosed.
        </p>
        <p>
          When We disclose personal information for a business purpose or a
          commercial purpose, We enter a contract that describes the purpose and
          requires the recipient to both keep that personal information
          confidential and not use it for any purpose except performing the
          contract.
        </p>
        <h2 id="sale-of-personal-information">Sale of Personal Information</h2>
        <p>
          As defined in the CCPA, &quot;sell&quot; and &quot;sale&quot; mean
          selling, renting, releasing, disclosing, disseminating, making
          available, transferring, or otherwise communicating orally, in
          writing, or by electronic or other means, a consumer&#39;s personal
          information by the business to a third party for valuable
          consideration. This means that We may have received some kind of
          benefit in return for sharing personal Iinformation, but not
          necessarily a monetary benefit.
        </p>
        <p>
          Please note that the categories listed below are those defined in the
          CCPA. This does not mean that all examples of that category of
          personal information were in fact sold, but reflects our good faith
          belief to the best of our knowledge that some of that information from
          the applicable category may be and may have been shared for value in
          return.
        </p>
        <p>
          We may sell and may have sold in the last twelve (12) months the
          following categories of personal information:
        </p>
        <p>Category A: Identifiers</p>
        <p>
          Category B: Personal information categories listed in the California
          Customer Records statute (Cal. Civ. Code § 1798.80(e))
        </p>
        <p>Category F: Internet or other similar network activity</p>
        <h2 id="share-of-personal-information">
          Share of Personal Information
        </h2>
        <p>
          We may share Your personal information identified in the above
          categories with the following categories of third parties:
        </p>
        <p>Service Providers</p>
        <p>Our affiliates</p>
        <p>Our business partners</p>
        <p>
          Third party vendors to whom You or Your agents authorize Us to
          disclose Your personal information in connection with products or
          services We provide to You
        </p>
        <h2 id="sale-of-personal-information-of-minors-under-16-years-of-age">
          Sale of Personal Information of Minors Under 16 Years of Age
        </h2>
        <p>
          We do not sell the personal information of Consumers We actually know
          are less than 16 years of age, unless We receive affirmative
          authorization (the &quot;right to opt-in&quot;) from either the
          Consumer who is between 13 and 16 years of age, or the parent or
          guardian of a Consumer less than 13 years of age. Consumers who opt-in
          to the sale of personal information may opt-out of future sales at any
          time. To exercise the right to opt-out, You (or Your authorized
          representative) may submit a request to Us by contacting Us as
          indicated below in the &quot;Exercising Your CCPA Data Protection
          Rights&quot; of this Privacy Policy.
        </p>
        <p>
          If You have reason to believe that a child under the age of 13 (or 16)
          has provided Us with personal information, please contact Us with
          sufficient detail to enable Us to delete that information.
        </p>
        <h2 id="your-rights-under-the-ccpa">Your Rights under the CCPA</h2>
        <p>
          The CCPA provides California residents with specific rights regarding
          their personal information. If You are a resident of California, You
          have the following rights:
        </p>
        <ul>
          <li>
            <strong>The right to notice.</strong> You have the right to be
            notified which categories of Personal Data are being collected and
            the purposes for which the Personal Data is being used.
          </li>
          <li>
            <p>
              <strong>The right to request.</strong> Under CCPA, You have the
              right to request that We disclose information to You about Our
              collection, use, sale, disclosure for business purposes and share
              of personal information. See the &quot;Exercising Your CCPA Data
              Protection Rights&quot; section of this Privacy Policy for
              information on how You may make Your request. Once We receive and
              confirm Your request, We will disclose to You:
            </p>
          </li>
          <li>
            <p>The categories of personal information We collected about You</p>
          </li>
          <li>
            The categories of sources for the personal information We collected
            about You
          </li>
          <li>
            Our business or commercial purpose for collecting or selling that
            personal information
          </li>
          <li>
            The categories of third parties with whom We share that personal
            information
          </li>
          <li>
            The specific pieces of personal information We collected about You
          </li>
          <li>
            <p>
              If we sold Your personal information or disclosed Your personal
              information for a business purpose, We will disclose to You:
            </p>
          </li>
          <li>
            <p>The categories of personal information categories sold</p>
          </li>
          <li>
            <p>The categories of personal information categories disclosed</p>
          </li>
          <li>
            <p>
              <strong>
                The right to say no to the sale of Personal Data (opt-out).
              </strong>
              You have the right to direct Us to not sell Your personal
              information. To submit an opt-out request please contact Us as
              indicated below in the &quot;Exercising Your CCPA Data Protection
              Rights&quot; section of this Privacy Policy.
            </p>
          </li>
          <li>
            <p>
              <strong>The right to delete Personal Data.</strong> You have the
              right to request the deletion of Your Personal Data, subject to
              certain exceptions. . See the &quot;Exercising Your CCPA Data
              Protection Rights&quot; section of this Privacy Policy for
              information on how You may make Your request. Once We receive and
              confirm Your request, We will delete (and direct Our Service
              Providers to delete) Your personal information from our records,
              unless an exception applies. We may deny Your deletion request if
              retaining the information is necessary for Us or Our Service
              Providers to:
            </p>
          </li>
          <li>
            <p>
              Complete the transaction for which We collected the personal
              information, provide a good or service that You requested, take
              actions reasonably anticipated within the context of our ongoing
              business relationship with You, or otherwise perform our contract
              with You.
            </p>
          </li>
          <li>
            Detect security incidents, protect against malicious, deceptive,
            fraudulent, or illegal activity, or prosecute those responsible for
            such activities.
          </li>
          <li>
            Debug products to identify and repair errors that impair existing
            intended functionality.
          </li>
          <li>
            Exercise free speech, ensure the right of another consumer to
            exercise their free speech rights, or exercise another right
            provided for by law.
          </li>
          <li>
            Comply with the California Electronic Communications Privacy Act
            (Cal. Penal Code § 1546 et. seq.).
          </li>
          <li>
            Engage in public or peer-reviewed scientific, historical, or
            statistical research in the public interest that adheres to all
            other applicable ethics and privacy laws, when the information&#39;s
            deletion may likely render impossible or seriously impair the
            research&#39;s achievement, if You previously provided informed
            consent.
          </li>
          <li>
            Enable solely internal uses that are reasonably aligned with
            consumer expectations based on Your relationship with Us.
          </li>
          <li>Comply with a legal obligation.</li>
          <li>
            <p>
              Make other internal and lawful uses of that information that are
              compatible with the context in which You provided it.
            </p>
          </li>
          <li>
            <p>
              <strong>The right not to be discriminated against.</strong> You
              have the right not to be discriminated against for exercising any
              of Your consumer&#39;s rights, including by:
            </p>
          </li>
          <li>
            <p>Denying goods or services to You</p>
          </li>
          <li>
            Charging different prices or rates for goods or services, including
            the use of discounts or other benefits or imposing penalties
          </li>
          <li>
            Providing a different level or quality of goods or services to You
          </li>
          <li>
            Suggesting that You will receive a different price or rate for goods
            or services or a different level or quality of goods or services
          </li>
        </ul>
        <h2 id="exercising-your-ccpa-data-protection-rights">
          Exercising Your CCPA Data Protection Rights
        </h2>
        <p>
          In order to exercise any of Your rights under the CCPA, and if You are
          a California resident, You can contact Us:
        </p>
        <ul>
          <li>By email: support@noteaffect.com</li>
        </ul>
        <p>
          Only You, or a person registered with the California Secretary of
          State that You authorize to act on Your behalf, may make a verifiable
          request related to Your personal information.
        </p>
        <p>Your request to Us must:</p>
        <ul>
          <li>
            Provide sufficient information that allows Us to reasonably verify
            You are the person about whom We collected personal information or
            an authorized representative
          </li>
          <li>
            Describe Your request with sufficient detail that allows Us to
            properly understand, evaluate, and respond to it
          </li>
        </ul>
        <p>
          We cannot respond to Your request or provide You with the required
          information if we cannot:
        </p>
        <ul>
          <li>Verify Your identity or authority to make the request</li>
          <li>And confirm that the personal information relates to You</li>
        </ul>
        <p>
          We will disclose and deliver the required information free of charge
          within 45 days of receiving Your verifiable request. The time period
          to provide the required information may be extended once by an
          additional 45 days when reasonable necessary and with prior notice.
        </p>
        <p>
          Any disclosures We provide will only cover the 12-month period
          preceding the verifiable request&#39;s receipt.
        </p>
        <p>
          For data portability requests, We will select a format to provide Your
          personal information that is readily useable and should allow You to
          transmit the information from one entity to another entity without
          hindrance.
        </p>
        <h2 id="do-not-sell-my-personal-information">
          Do Not Sell My Personal Information
        </h2>
        <p>
          You have the right to opt-out of the sale of Your personal
          information. Once We receive and confirm a verifiable consumer request
          from You, we will stop selling Your personal information. To exercise
          Your right to opt-out, please contact Us as indicated above in the
          &quot;Exercising Your CCPA Data Protection Rights&quot; section of
          this Privacy Policy.
        </p>
        <h1 id="-quot-do-not-track-quot-policy-as-required-by-california-online-privacy-protection-act-caloppa-">
          &quot;Do Not Track&quot; Policy as Required by California Online
          Privacy Protection Act (CalOPPA)
        </h1>
        <p>Our Service does not respond to Do Not Track signals.</p>
        <p>
          However, some third party websites do keep track of Your browsing
          activities. If You are visiting such websites, You can set Your
          preferences in Your web browser to inform websites that You do not
          want to be tracked. You can enable or disable DNT by visiting the
          preferences or settings page of Your web browser.
        </p>
        <h1 id="children-39-s-privacy">Children&#39;s Privacy</h1>
        <p>
          The Service may contain content appropriate for children under the age
          of 13. As a parent, You should know that through the Service children
          under the age of 13 may participate in activities that involve the
          collection or use of personal information. We use reasonable efforts
          to ensure that before We collect any personal information from a
          child, the child&#39;s parent receives notice of and consents to our
          personal information practices.
        </p>
        <p>
          We also may limit how We collect, use, and store some of the
          information of Users between 13 and 18 years old. In some cases, this
          means We will be unable to provide certain functionality of the
          Service to these Users. If We need to rely on consent as a legal basis
          for processing Your information and Your country requires consent from
          a parent, We may require Your parent&#39;s consent before We collect
          and use that information.
        </p>
        <p>
          We may ask a User to verify its date of birth before collecting any
          personal information from them. If the User is under the age of 13,
          the Service will be either blocked or redirected to a parental consent
          process.
        </p>
        <h2 id="information-collected-from-children-under-the-age-of-13">
          Information Collected from Children Under the Age of 13
        </h2>
        <p>
          The Company may collect and store persistent identifiers such as
          cookies or IP addresses from Children without parental consent for the
          purpose of supporting the internal operation of the Service.
        </p>
        <p>
          We may collect and store other personal information about children if
          this information is submitted by a child with prior parent consent or
          by the parent or guardian of the child.
        </p>
        <p>
          The Company may collect and store the following types of personal
          information about a child when submitted by a child with prior
          parental consent or by the parent or guardian of the child:
        </p>
        <ul>
          <li>First and/or last name</li>
          <li>Date of birth</li>
          <li>Gender</li>
          <li>Grade level</li>
          <li>Email address</li>
          <li>Telephone number</li>
          <li>Parent&#39;s or guardian&#39;s name</li>
          <li>Parent&#39;s or guardian&#39;s email address</li>
        </ul>
        <p>
          For further details on the information We might collect, You can refer
          to the &quot;Types of Data Collected&quot; section of this Privacy
          Policy. We follow our standard Privacy Policy for the disclosure of
          personal information collected from and about children.
        </p>
        <h2 id="parental-access">Parental Access</h2>
        <p>
          A parent who has already given the Company permission to collect and
          use his child personal information can, at any time:
        </p>
        <ul>
          <li>
            Review, correct or delete the child&#39;s personal information
          </li>
          <li>
            Discontinue further collection or use of the child&#39;s personal
            information
          </li>
        </ul>
        <p>
          To make such a request, You can write to Us using the contact
          information provided below in the &quot;Contact Us&quot; section of
          this Privacy Policy.
        </p>
        <h1 id="your-california-privacy-rights-california-39-s-shine-the-light-law-">
          Your California Privacy Rights (California&#39;s Shine the Light law)
        </h1>
        <p>
          Under California Civil Code Section 1798 (California&#39;s Shine the
          Light law), California residents with an established business
          relationship with Us can request information once a year about sharing
          their Personal Data with third parties for the third parties&#39;
          direct marketing purposes.
        </p>
        <p>
          If You would like to request more information under the California
          Shine the Light law, and if You are a California resident, You can
          contact Us using the contact information provided below in the
          &quot;Contact Us&quot; section of this Privacy Policy.
        </p>
        <h1 id="california-privacy-rights-for-minor-users-california-business-and-professions-code-section-22581-">
          California Privacy Rights for Minor Users (California Business and
          Professions Code Section 22581)
        </h1>
        <p>
          California Business and Professions Code section 22581 allow
          California residents under the age of 18 who are registered users of
          online sites, services or applications to request and obtain removal
          of content or information they have publicly posted.
        </p>
        <p>
          To request removal of such data, and if You are a California resident,
          You can contact Us using the contact information provided below in the
          &quot;Contact Us&quot; section of this Privacy Policy, and include the
          email address associated with Your account.
        </p>
        <p>
          Be aware that Your request does not guarantee complete or
          comprehensive removal of content or information posted online and that
          the law may not permit or require removal in certain circumstances.
        </p>
        <h1 id="links-to-other-websites">Links to Other Websites</h1>
        <p>
          Our Service may contain links to other websites that are not operated
          by Us. If You click on a third party link, You will be directed to
          that third party&#39;s site. We strongly advise You to review the
          Privacy Policy of every site You visit.
        </p>
        <p>
          We have no control over and assume no responsibility for the content,
          privacy policies or practices of any third party sites or services.
        </p>
        <h1 id="changes-to-this-privacy-policy">
          Changes to this Privacy Policy
        </h1>
        <p>
          We may update Our Privacy Policy from time to time. We will notify You
          of any changes by posting the new Privacy Policy on this page.
        </p>
        <p>
          We will let You know via email and/or a prominent notice on Our
          Service, prior to the change becoming effective and update the
          &quot;Last updated&quot; date at the top of this Privacy Policy.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any
          changes. Changes to this Privacy Policy are effective when they are
          posted on this page.
        </p>
        <h1 id="contact-us">Contact Us</h1>
        <p>
          If you have any questions about this Privacy Policy, You can contact
          us:
        </p>
        <p>General Questions</p>
        <ul>
          <li>
            By email:&nbsp;
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:support@noteaffect.com"
            >
              support@noteaffect.com
            </a>
          </li>
        </ul>
        <p>Data Protect officer: Jay Tokosch</p>
        <ul>
          <li>
            By email:&nbsp;
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:dpofficer@noteaffect.com"
            >
              dpofficer@noteaffect.com
            </a>
          </li>
        </ul>
      </GenericModal>
    );
  }
}

export default CorpPrivacyModal;
