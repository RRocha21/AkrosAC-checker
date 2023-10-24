import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import socketIOClient from 'socket.io-client';
import tmi from 'tmi.js';
import 'dotenv/config';
import axios from 'axios';
import fetch from 'isomorphic-unfetch';
import io from 'socket.io-client';

const port = parseInt(process.env.PORT, 10) || 3000;

export default function Home({}) {
  useEffect(() => {
    const socket = io(`https://king-prawn-app-9ucth.ondigitalocean.app`);

    socket.on('event', (data) => {
      console.log('Event received:', data);
      // Here you can set the state or call functions in your component
    });

    return () => {
      socket.disconnect();
    };
  }, [1000]);  
  
}

export async function getStaticProps({ params }) {
    const { db } = await connectToDatabase();

    try {
      const params2 = {
        'licenseKey': '62e448abcd415a26',
        'serviceId': 'CS2',
      };

      const response = await axios.get('https://secure-api.akros.ac/v1/ISession/ValidateLicense?licenseKey=62e448abcd415a26&serviceId=CS2', { params: params2 });
      console.log('Validation Response:', response.data);
      const responseData = response.data;

      const paramsToRegister = {
        'licenseKey': '62e448abcd415a26',
        'serviceId': 'default',
        'secret': 'testshitout',
        'uri': 'https://king-prawn-app-9ucth.ondigitalocean.app/api/events',
        'gameProcess': 'cs2.exe'
      };

      const responseFromRegister = await axios.post('https://secure-api.akros.ac/v1/IWebHook/Register', paramsToRegister);
      console.log('Registration Response:', responseFromRegister.data);
    } catch (error) {
      console.error('Error registering webhook:', error);
    }

    return {
      props: {
        events: [],
      },
    };
}