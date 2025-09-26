'use client';

import dynamic from 'next/dynamic';

export default dynamic(() => import('./popup-page'), { ssr: false });
