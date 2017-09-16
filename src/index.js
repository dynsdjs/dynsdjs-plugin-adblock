import fetch from 'node-fetch'
import ip from 'ip'

const rulesUrl = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts'

// We will use this to store a reference to the dynsd chalk instance
let chalk = null

function start( resolve, reject, data ) {
  fetch( rulesUrl )
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
                      A: {
                        name: domain,
                        address: ip.address( 'private', 'ipv4' ),
                        ttl: 600
                      },
                      AAAA: {
                        name: domain,
                        address: ip.address( 'private', 'ipv6' ),
                        ttl: 600
                      }
                    }
                  )
              }
            }
          )

        data.entries
          .keys(
            ( err, keys ) => {
              console.log( `[${chalk.blue('ADBLOCK')}] ${chalk.green(keys.length)} rules fetched.` )
              resolve()
            }
          )
      }
    )
}

export default class {
  constructor( dns ) {
    chalk = dns.chalk

    dns
      .on( 'init', ( resolve, reject, data ) => {
        console.log( `[${chalk.blue('ADBLOCK')}] Starting to fetch rules from '${chalk.green(rulesUrl)}'...` )
        start( resolve, reject, data )
      })
  }
}