import { FastifyRequest, FastifyReply } from "fastify";
import { PokemonWithStats } from "models/PokemonWithStats";
const axios = require('axios')

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {
  var name: string = request.params['name']

  // reply.headers['Accept'] = 'application/json'

  var urlApiPokeman = `https://pokeapi.co/api/v2/pokemon/`;

  var params = {}

  name == null
    ? name.trim() != ''
      ? (params["name"] = name, urlApiPokeman = urlApiPokeman + '/', urlApiPokeman = urlApiPokeman + name)
      : (urlApiPokeman = urlApiPokeman + '?offset=20', urlApiPokeman = urlApiPokeman + '&limit=20')
    : (urlApiPokeman = urlApiPokeman + '?offset=20', urlApiPokeman = urlApiPokeman + '&limit=20')


  // const http = require('http');
  // const keepAliveAgent = new http.Agent({ keepAlive: true });

  // let response: any = ""

  // http.request({ ...reply.headers, ...({ hostname: urlApiPokeman, port: 80, }) }, (result) => { response = result })

  let response = await callUrl(urlApiPokeman);
  response = response.data.results;

  if (response == null) {
    reply.code(404)
  }

  computeResponse(response, reply)

  reply.send(response)

  return reply
}

export const computeResponse = async (response: unknown, reply: FastifyReply) => {
  const resp = response as any

  // let types = resp.types.map(type => type.type).map(type => { return type.url }).reduce((types, typeUrl) => types.push(typeUrl));
  const types = resp.map(type => { return type.url })

  let pokemonTypes = []

  for( let element of types) {
    // const http = require('http');
    // const keepAliveAgent = new http.Agent({ keepAlive: true });
    // http.request({ hostname: element }, (response) => pokemonTypes.push(response))

    const response = await callUrl(element);
    pokemonTypes.push(response)
  }

  if (pokemonTypes == undefined)
    throw pokemonTypes

  for(let element of resp) {
    var stats = []

    pokemonTypes.map(pok =>
      pok.data.stats.map(st =>
        st.stat.name.toUpperCase() == element.name.toUpperCase()
          ? stats.push(pok.data.stats.base_stat)
          : ([])
      )
    )

    if (stats.length > 0) {
      let avg = stats.reduce((a, b) => a + b) / stats.length
      element.averageStat = avg
    } else {
      element.averageStat = 0
    }
  }

}

const callUrl = async (url: string) => {
  let response: any

  await axios
    .get(url)
    .then(result => {
      response = result;
    })
    .catch(error => {
      console.error(error)
    })

  return response;
}