export interface Service {
  /** Stable identifier used as `cta_label` for analytics — never rename, even if `name` changes. */
  id: string;
  name: string;
  description: string;
  href: string;
}

export const SERVICES: Service[] = [
  {
    id: "virtual-desktop",
    name: "ARDC Virtual Desktop Service",
    description: "Your extra computer in the cloud.",
    href: "https://desktop.rc.nectar.org.au/",
  },
  {
    id: "jupyter-notebook",
    name: "ARDC Jupyter Notebook Service",
    description: "Develop code and computational output.",
    href: "https://jupyterhub.rc.nectar.org.au",
  },
  {
    id: "binderhub",
    name: "ARDC BinderHub Service",
    description:
      "Make code repositories shareable, executable and reproducible.",
    href: "https://binderhub.rc.nectar.org.au/",
  },
  {
    id: "nectar-dashboard",
    name: "Nectar Dashboard",
    description: "Fast, interactive, self-service cloud computing.",
    href: "https://dashboard.rc.nectar.org.au/",
  },
];
