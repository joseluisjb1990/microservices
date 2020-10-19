import axios from 'axios';

const buildClient = (ctx) => {
  if (typeof window === 'undefined') {

    return axios.create({
      baseURL: 'www.tickets-ms-course.xyz',
      headers: ctx.req.headers
    });
  } else {
    return axios.create({
      baseURL: '/'
    });
  }
}

export default buildClient;
