import * as Next from 'next';
import * as Request from 'server/Request';

export default Request.post((request, response) => {
  response.json({"hello": "world"})
})