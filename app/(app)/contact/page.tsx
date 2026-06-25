import { ContactForm } from "@/components/profile/ContactForm";
import { TopBar } from "@/components/layout/TopBar";
import { css } from "@/styled-system/css";

export default function ContactPage() {
  return (
    <>
      <TopBar back title="Contact" />
      <div className={css({ paddingX: "5", paddingTop: "5", paddingBottom: "10" })}>
        <ContactForm />
      </div>
    </>
  );
}
