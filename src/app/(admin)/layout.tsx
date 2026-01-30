import React, { ReactNode } from 'react';
import NavLayout from '@/src/components/ui/navLayout';

const layout = ({children}:{children:ReactNode}) => {
    return (
        <div>
            <NavLayout>
                <div className='min-h-[75vh]'>
                {children}
                </div>
            </NavLayout>
        </div>
    );
};

export default layout;