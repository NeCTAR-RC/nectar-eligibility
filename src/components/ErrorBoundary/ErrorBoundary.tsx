import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Link } from "@ardc-ui/react";
import styles from "./ErrorBoundary.module.scss";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <h1 className={styles.heading}>Something went wrong</h1>
          <p className={styles.message}>
            This page isn't working right now. Please try again later or contact
            support if the problem persists.
          </p>
          <Link
            href="https://support.ehelp.edu.au"
            target="_blank"
            variant="primary"
            iconAfter="arrow-up-right-from-square"
          >
            Support Centre
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}
