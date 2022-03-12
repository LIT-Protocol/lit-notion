import Head from 'next/head'

import { NotionRenderer } from "react-notion-x";
import { useState } from 'react';
import Script from 'next/script'
import LitJsSdk from 'lit-js-sdk';
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

const litNodeClient = new LitJsSdk.LitNodeClient()
litNodeClient.connect()


export default function Home() {

  function closeModal() {
    console.log("close share modal");
    ACCM.ReactContentRenderer.unmount(document.getElementById("shareModal"));
  }
  function openShareModal(callback) {
    console.log("open share modal");
    ACCM.ReactContentRenderer.render(
      ACCM.ShareModal,
      // props to be passed to the ShareModal component.  These are documented here: https://github.com/LIT-Protocol/lit-access-control-conditions-modal#props
      {
        sharingItems: [],
        onAccessControlConditionsSelected: function (accessControlConditions) {
          console.log(
            "accessControlConditions from ShareModal: ",
            accessControlConditions
          );
          callback(accessControlConditions);
          closeModal();
          // now, use the accessControlConditions to provision access using one of the methods below:
          // https://github.com/LIT-Protocol/lit-js-sdk#dynamic-content---provisoning-access-to-a-resource
          // or https://github.com/LIT-Protocol/lit-js-sdk#static-content---storing-any-static-content-and-manually-storing-the-metadata
        },
        onClose: closeModal,
        getSharingLink: function (sharingItem) {
          console.log("getSharingLink", sharingItem);
          return "";
        },
        showStep: "ableToAccess",
      },
      // target DOM node
      document.getElementById("shareModal")
    );
  }


  const [notionPageId, setNotionPageId] = useState('');
  const [showInstruction, toggleInsturction] = useState(false);
  const [state, setState] = useState('')
  const [url, setUrl] = useState('');

  const encrypt = async () => {
       
    openShareModal(async (accessControlConditions) => {
      console.warn("--- encrypting ---");
      
      // -- prepare signing conditions
      setState("Signing in wallet...");
      const chain = 'ethereum';
      const authSig = await LitJsSdk.checkAndSignAuthMessage({chain});
      const baseUrl = window.location.origin;
      
      // -- store notion page id and get a random unique id
      setState("Storing notion page...");
      const newNotionPageId = (await (await fetch(publicRuntimeConfig.BACKEND_API + '/notion/store', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ notionPageId })
      })).json()).id;

      // -- prepare resource id
      const path = '/' + newNotionPageId;

      const resourceId = {
        baseUrl,
        path,
        orgId: "",
        role: "",
        extraData: "",
      }
      const conditions = { accessControlConditions, chain, authSig, resourceId, permanant: false };

      setState("Storing conditions...");
      const storeResourceIdAndAccessControls = (await (await fetch(publicRuntimeConfig.BACKEND_API + '/notion/store-conditions', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
          newNotionPageId,
          accessControlConditions: JSON.stringify(accessControlConditions),
          resourceId,
        })
      })).json());

      console.log(">> storeResourceIdAndAccessControls:", storeResourceIdAndAccessControls);


      // ========== Signing ==========
      // -- debug
      console.log(">> baseUrl:", baseUrl);
      console.log(">> path:", path);
      console.log(">> Access Control Conditions:", accessControlConditions);
      console.log(">> resourceId:", resourceId);
      console.log(">> Conditions", conditions);
      
      // sign
      setState("Signing...");
      const sign = await litNodeClient.saveSigningCondition(conditions)
      console.log(">> Signed:", sign);

      setState(`Your URL:`);
      setUrl(baseUrl + path)
    })
  }

  const onClickExample = (e) => {
    const pageId = e.target.innerText;
    console.log(">> pageId:", pageId);
    setNotionPageId(pageId);
    toggleInsturction(false);
  }

  const onCopy = (e) => {
    navigator.clipboard.writeText(url).then(() => {
    e.target.innerText = 'Copied!';

    setTimeout(() => {
        e.target.innerText = 'Copy';
    }, 2000)
    
    }, (err) => {
        console.error('Async: Could not copy text: ', err);
    });
  }

  return (
    <>

<Head>
    <title>Lit Protocol | Notion</title>
    <meta name="description" content="Token-gate your notion page!" />

    <meta property="og:type" content="website" />
    {/* <meta property="og:url" content={link} />
    <meta property="og:title" content={title} /> */}
    <meta property="og:description" content="Token-gate your notion page!" />
    {/* <meta property="og:image" content={image} /> */}

    <meta property="twitter:card" content="summary_large_image" />
    {/* <meta property="twitter:url" content={link} />
    <meta property="twitter:title" content={title} /> */}
    <meta property="twitter:description" content="Token-gate your notion page!" />
    {/* <meta property="twitter:image" content={image} /> */}

    <link rel="icon" href="/favicon.ico" />
  </Head>

      <div id="shareModal"></div>
      <h1>Lit Protocol | Notion</h1>
      Copy the url after "notion.site/" <a href="#" onClick={() => toggleInsturction(! showInstruction)}>{showInstruction ? 'hide' : 'show'} instruction</a><br/>
      {
        showInstruction ? <>
          <hr/>
          Examples: (Click to use)<br/>
          <ul id="eg">
            <li onClick={(e) => onClickExample(e)}>Notion-Kit-Test-Suite-067dd719a912471ea9a3ac10710e7fdf</li>
            <li onClick={(e) => onClickExample(e)}>Basic-Blocks-0be6efce9daf42688f65c76b89f8eb27</li>
            <li onClick={(e) => onClickExample(e)}>Lists-de14421f13914ac7b528fa2e31eb1455</li>
            <li onClick={(e) => onClickExample(e)}>Small-Text-3702a5d6403d4d58b8a944a77ca26c70</li>
            <li onClick={(e) => onClickExample(e)}>Color-Rainbow-54bf56611797480c951e5c1f96cb06f2</li>
          </ul>
          <img src="/tut.png" /><br/>
        </> : ''
      }
      <hr/>
      <input placeholder="notion page id" value={notionPageId} type="text" onChange={(e) => setNotionPageId(e.target.value)} />
      <button onClick={() => encrypt()}>Encrypt Notion Page!</button>
      {
        state == '' ? '' 
        : 
        <>
          <hr/> { state } <a  target="_blank" href={url}>{ url } </a> <button onClick={(e) => onCopy(e)}>Copy</button>
        </>
      }
      
      {/* -- modal libs -- */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/lit-access-control-conditions-modal-vanilla-js/dist/main.css"
      />
      <Script src="https://cdn.jsdelivr.net/npm/lit-access-control-conditions-modal-vanilla-js/dist/index.js"></Script>
    </>
  )
}