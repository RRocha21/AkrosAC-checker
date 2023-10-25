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
  try {
    const response = await fetch(`https://king-prawn-app-9ucth.ondigitalocean.app/api/getSteamUsername?steamUID=${steamUID}`);
    if (response.ok) {
      const data = await response.json();
      return data.username;
    } else {
      console.error('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error retrieving Steam username:', error);
    return null;
  }
}


export default function Home() {
  const [usernames, setUsernames] = useState([]);
  const [events, setEvents] = useState([]); // assuming you need to use events

  useEffect(() => {
    const socket = io(`https://king-prawn-app-9ucth.ondigitalocean.app`);
    socket.connect();

    socket.on('event', async (data) => {
      console.log('Event received:', data);

      const userId = data.data?.userId;
      const actionId = data.id; // assuming you get actionId (3 for add, 4 for remove)
      // const username = await getSteamUsername('76561198262506391');
      // console.log('Username:', username);
      if (userId && actionId) {
        // const username = await getSteamUsername(userId);
        // console.log('Username:', username);
        if ( actionId === 3) {
          // Add username to array if not already present
          setUsernames((prevUsernames) => {
            if (!prevUsernames.includes(userId)) {
              return [...prevUsernames, userId];
            }
            return prevUsernames;
          });
        } else if (actionId === 4) {
          // Remove username from array if present
          setUsernames((prevUsernames) => {
            return prevUsernames.filter((u) => u !== userId);
          });
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Usernames</h1>
      {usernames.length > 0 ? (
        <p>{usernames.join(', ')}</p>
      ) : (
        <p>No usernames available</p>
      )}
    </div>
  );
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