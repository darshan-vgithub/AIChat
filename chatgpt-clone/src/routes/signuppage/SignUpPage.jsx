import "./SignUpPage.css";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div>
      <SignUp path="/sign-up" />
    </div>
  );
};

export default SignUpPage;
