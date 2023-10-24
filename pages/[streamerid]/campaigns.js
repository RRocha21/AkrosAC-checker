import Head from 'next/head'
import { connectToDatabase } from '../../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';
import tmi from 'tmi.js';
import 'dotenv/config';
import axios from 'axios';
import fetch from 'isomorphic-unfetch';


export default function Home({}) {

}

export async function getStaticPaths() {

  
      return { paths: [], fallback: true };

}

export async function getStaticProps({ params }) {
    const { db } = await connectToDatabase();

    const params2 = {
      'licenseKey': '62e448abcd415a26',
      'serviceId': 'CS2',
    };

    const response = await axios.get('https://secure-api.akros.ac/v1/ISession/ValidateLicense?licenseKey=62e448abcd415a26&serviceId=CS2', { params2 });
    console.log(response.data);
    const responseData = response.data;

    const paramsToRegister = {
      'licenseKey': responseData.licenseKey,
      'serviceId': 'default',
      'secret': '62e448abcd415a26',
      'callbackUrl': 'http://localhost:3000/events',
      'gameProcess': 'cs2.exe'
    };

    const responseFromRegister = await axios.post('https://secure-api.akros.ac/v1/IWebHook/Register', { paramsToRegister });
    console.log(responseFromRegister.data);

  
    return {
        props: { },
        revalidate: 1
    };
}

function getOcorrence(array, value) {
    return array.filter((v) => (v === value)).length;
}