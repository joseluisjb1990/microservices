import axios from 'axios';

const buildClient = (ctx) => {
  if (typeof window === 'undefined') {

    return axios.create({
      baseURL: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
      headers: ctx.req.headers
    });
  } else {
    return axios.create({
      baseURL: '/'
    });
  }
}

export default buildClient;
