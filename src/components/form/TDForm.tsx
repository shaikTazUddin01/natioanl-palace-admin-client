import React, { ReactNode, useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";


interface IFormConfig{
  resolver?:any;
  defaultValues?:any

}

interface IProps extends IFormConfig{
  children: ReactNode;
  onSubmit: SubmitHandler<any>;
}

const TDForm = ({ children, onSubmit,resolver,defaultValues }: IProps) => {
 const formConfig  : IFormConfig = {}


if (!!defaultValues) {
  formConfig['defaultValues']=defaultValues
  // console.log(formConfig['resolver']);
}
if (!!resolver) {
  formConfig['resolver']=resolver
  // console.log(formConfig['resolver']);
}

const methods = useForm(formConfig);

useEffect(()=>{
  if (defaultValues) {
    methods.reset(defaultValues)
  }
},[defaultValues,methods])



  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
    </FormProvider>
  );
};

export default TDForm;