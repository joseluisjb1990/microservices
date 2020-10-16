import axios from 'axios';
import { useState } from 'react';

const useRequest  = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        return onSuccess(response.data);
      }

      return response.data;
    } catch(err) {
      console.error(err);
      setErrors(
      <div className="alert alert-danger">
        <ul className="my-0">
          {err && err.response.data.message.map(err => <li key={err.message}>{err.message}</li>)}
        </ul>
      </div>
      )
    }
  };

  return {
    doRequest,
    errors
  }
}

export default useRequest;
