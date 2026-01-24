export type TError = {
    data:{
     success:boolean;
     message:string;
     status:number
    }
   };
   export type TResponse<T> = {
     data?: T;
     error?:TError;
     message: string;
     statusCode: number;
     success: boolean;
   };