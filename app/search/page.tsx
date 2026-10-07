'use client';
import { useState } from 'react';
export default function SearchPage(){const [q,setQ]=useState(''); const [items,setItems]=useState<any[]>([]);
return <main className='space-y-4'><h1 className='text-2xl'>Поиск</h1><div className='card'><input value={q} onChange={e=>setQ(e.target.value)} className='w-full rounded border p-2' placeholder='Поиск по тексту, людям, местам'/><button onClick={async()=>setItems((await (await fetch('/api/search?q='+encodeURIComponent(q))).json()).items)} className='mt-2 rounded bg-slate-900 px-3 py-2 text-white'>Найти</button></div><ul>{items.map(i=><li key={i.id} className='card my-2'>{i.title}</li>)}</ul></main>}
