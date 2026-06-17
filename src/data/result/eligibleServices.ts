export interface Service {
  /** Stable identifier used as `cta_label` for analytics — never rename, even if `name` changes. */
  id: string;
  name: string;
  description: string;
  href: string;
}

export const SERVICES: Service[] = [
  {
    id: "nectar-dashboard",
    name: "Nectar Research Cloud",
    description: "Fast, interactive, self-service cloud computing.",
    href: "https://dashboard.rc.nectar.org.au/",
  },
  {
    id: "virtual-desktop",
    name: "Virtual Desktop Service",
    description: "Your extra computer in the cloud.",
    href: "https://desktop.rc.nectar.org.au/",
  },
  {
    id: "jupyter-notebook",
    name: "Jupyter Notebook Service",
    description: "Develop code and computational output.",
    href: "https://jupyterhub.rc.nectar.org.au",
  },
  {
    id: "binderhub",
    name: "BinderHub Service",
    description:
      "Make code repositories shareable, executable and reproducible.",
    href: "https://binderhub.rc.nectar.org.au/",
  },
];
