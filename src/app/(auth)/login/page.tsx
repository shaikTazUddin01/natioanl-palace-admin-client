/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import Image from "next/image";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

import { toast } from "sonner";

import loginImage from "@/src/assets/travelLogin.webp";
import loginBg from "@/src/assets/login1.webp";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginApiMutation } from "@/src/redux/features/auth/authApi";
import { useAppDispatch } from "@/src/redux/hooks";
import { TResponse } from "@/src/types";
import { decodedToken } from "@/src/utils/decodedToken";
import { authInfo } from "@/src/redux/features/auth/authSlice";
import TDForm from "@/src/components/form/TDForm";
import { loginValidation } from "@/src/validation/loginValidation";
import TDInput from "@/src/components/form/TDInput";

const Page = () => {
  const [login] = useLoginApiMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogin: SubmitHandler<FieldValues> = async (data) => {
    try {
      const res = (await login(data)) as TResponse<any>;
      
      if (!res?.data) {
        toast.error(res?.error?.data?.message);
        return;
      }

      toast.success("login success");

      const accessToken = res.data.data;
      const decoded = await decodedToken(accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; secure; SameSite=Strict`;

      dispatch(authInfo({ data: decoded, token: accessToken }));
      router.push("/");
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full lg:p-20 bg-cover flex items-center justify-center text-black"
      style={{ backgroundImage: `url(${loginBg.src})` }}
    >
      <div className="bg-white rounded-2xl grid grid-cols-1 lg:grid-cols-2 shadow max-w-7xl w-full">
        {/* Image Section */}
        <div className="hidden lg:flex min-w-[500px] min-h-[450px]">
          <Image
            src={loginImage}
            alt="login image"
            className="object-cover w-full h-full rounded-2xl"
          />
        </div>

        {/* Form Section */}
        <div className="p-10 w-full lg:w-[80%] mx-auto text-center">
          <div className="mb-4 space-y-1">
            <h1 className="text-sky-600 text-3xl lg:text-5xl font-bold">
              Wellcome
            </h1>
            <p>Login with Test Admin Information</p>
          </div>

          <TDForm
            resolver={zodResolver(loginValidation)}
            onSubmit={handleLogin}
          >
            <div className="space-y-2 text-left">
              <TDInput label="Email" name="email" type="email" required />

              <TDInput
                label="Password"
                name="password"
                type="password"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#390dff] !text-white p-2 rounded-3xl cursor-pointer "
              >
                Login
              </button>
            </div>
          </TDForm>
        </div>
      </div>
    </div>
  );
};

export default Page;
