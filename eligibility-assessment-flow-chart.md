---
config:
  layout: dagre
---
flowchart TB
    A(["Start"]) --> n46["What professional position or role best describes you?"]
    B{"Are you affiliated with (or collaborating with members of) an Australian University or Australian Research Institution?"} --> C["Yes"] & D["No"]
    C --> n1["Are you (or your collaborators) funded by:"]
    D --> n37["Are you affiliated with (or collaborating with members of) the University of Auckland?"]
    n1 --> n53@{ label: "<span id=\"docs-internal-guid-658e63bc-7fff-9800-2f98-a64f64be9952\"><span style=\"font-size:\">A national or international research grant</span></span>" } & n54@{ label: "<span id=\"docs-internal-guid-b55ab9ac-7fff-e1cf-f190-4ff39e80d5f6\"><a href=\"https://www.education.gov.au/national-research-infrastructure/funded-research-infrastructure-projects\" style=\"text-decoration:none;\"><span style=\"font-size:\">A National Collaborative Research Infrastructure Strategy (NCRIS) capability</span></a></span>" } & n55@{ label: "<span id=\"docs-internal-guid-676b118c-7fff-277e-d6f3-ce4e3db0f711\"><span style=\"font-size:\">A federal or state government department grant</span></span>" } & n56@{ label: "<span id=\"docs-internal-guid-1c869309-7fff-7484-d82f-b4992507debb\"><span style=\"font-size:\">A grant from industry supporting research</span></span>" } & n57["None of the above"]
    n10["Are you (or your collaborators) affiliated with an ARDC Nectar member organisation?"] --> n11["Yes (affiliated organisation is listed as a Nectar member). Select organisation (optional), e.g. University of Melbourne, UNSW"] & n59["No (affiliated organisation is not listed as a Nectar member)"]
    n11 --> n64["Select organisation (optional), e.g. University of Melbourne, UNSW"]
    n37 --> n38["Yes"] & n39["No"]
    n38 --> n1
    n45(["Other requirements for allocations: 1. You need AAF or Tuakiri credentials to log into the Nectar Dashboard; 2. You must follow the Sensitive Data Guidelines; 3. You must have an ORCID account to connect to your Nectar Dashboard; 4. You must agree to the terms of the service."]) --> n60["I understand the requirements."]
    n46 --> n47["Researcher"] & n48["Research Data/Software/Support Professional"] & n49["Librarian/Trainer"] & n50["Manager of People and/or Policy"] & n51["None of the above"]
    n47 --> B
    n48 --> B
    n49 --> B
    n50 --> B
    n51 --> B
    n57 --> n10
    n53 --> n4(["It looks like you may be eligible for a national allocation on the Nectar Cloud. But there are some other requirements you must consider before applying for an allocation."])
    n54 --> n4
    n55 --> n4
    n56 --> n4
    n59 --> n14(["The selections you have made in this assessment indicate that you are not eligible for an allocation on the Nectar Cloud. However, you may still be able to access the Nectar Cloud with a 6 month project trial or use other ARDC services powered by the Nectar Cloud, providing you meet the requirements."])
    n13@{ label: "It looks like you may be eligible for a local allocation, pending your institution and the ARDC Nectar node's discretion. But there are some other requirements you must consider before applying for an allocation." } --> n45
    n4 --> n45
    n60 --> n36(["Assessment Complete: successful page"])
    n14 --> n62(["Requirements for a project trial or ARDC services powered by the Nectar Cloud:1. You need AAF or Tuakiri credentials to log into the Nectar Dashboard; 2. You must agree to the terms of the service."])
    n28["I understand the requirements"] --> n61(["Assessment Complete: unsuccessful page"])
    n62 --> n28
    n39 --> n14
    n64 --> n13

    n46@{ shape: diam}
    n1@{ shape: diam}
    n37@{ shape: diam}
    n53@{ shape: rect}
    n54@{ shape: rect}
    n55@{ shape: rect}
    n56@{ shape: rect}
    n10@{ shape: diam}
    n13@{ shape: stadium}
    n28@{ shape: rect}
    style n45 fill:#FFF9C4,stroke:none
    style n4 fill:#C8E6C9,stroke:none
    style n14 fill:#FFE0B2,stroke:none
    style n13 fill:#C8E6C9,stroke:none
    style n36 fill:#C8E6C9,stroke:none
    style n62 fill:#FFF9C4,stroke:none
    style n61 fill:#FFE0B2,stroke:none