import { Outlet } from "react-router";
import Header from "../Header/Header";
import styles from "./Layout.module.scss";

export default function Layout() {
  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
