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

async function getSteamUsername(steamUID) {
  const apiKey = '8D84EBFF5DCB6429F357949D448F406F';
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamUID}`;

  try {
    const response = await axios.get(url);
    const players = response.data.response.players;
    if (players.length > 0) {
      const username = players[0].personaname;
      console.log('Steam Username:', username);
      return username;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving Steam username:', error);
    return null;
  }
}

export default function Home({}) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const socket = io(`https://king-prawn-app-9ucth.ondigitalocean.app`);
    socket.connect()

    socket.on('event', async (data) => {
      console.log('Event received:', data);
      // Here you can set the state or call functions in your component
      const username = await getSteamUsername('76561198262506391');
      if (data.data?.userId) {
        console.log('User ID:', data.data.userId)
        const username = getSteamUsername(data.data.userId);
        console.log('Username:', username);
      }
    });
    
    // if ()


    return () => {
      socket.disconnect();
    };
  }, []);
  

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