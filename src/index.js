import fetch from 'node-fetch'
import ip from 'ip'

function start( resolve, reject, data ) {
  fetch( 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts' )
    .then( res => res.text() )
    .then( body => {
        body
          .split('\n')
          .forEach(
            line => {
              if ( !line.startsWith( '#' ) ) {
                const host = line.split( /\s+/ )
                let domain = ''

                if ( host.length < 2 )
                  domain = host[0]
                else
                  domain = host[1]

                data.entries
                  .set(
                    domain,
                    {
                      address: ip.address( 'private', 'ipv4' ),
                      address6: ip.address( 'private', 'ipv6' )
                    }
                  )
              }
            }
          )

        resolve()
      }
    )
}

export default class {
  constructor( dns ) {
    dns
      .on( 'init', ( resolve, reject, data ) => {
        start( resolve, reject, data )
      })
  }
}