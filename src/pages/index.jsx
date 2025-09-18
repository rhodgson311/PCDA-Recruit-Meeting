import Head from 'next/head'
import dynamic from 'next/dynamic'

const PCDAInteractiveForm = dynamic(() => import('../components/PCDAInteractiveForm'), { ssr: false })

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head>
        <title>PCDA Interactive Presentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="PCDA interactive presentation form for prospective student-athletes" />
      </Head>
      <PCDAInteractiveForm />
    </div>
  )
}
