import fetch from 'node-fetch'
import ip from 'ip'

const rulesUrl = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts'

// We will use this to store a reference to the dynsd chalk instance
let chalk = null

function start( resolve, reject, data ) {
  fetch( rulesUrl )
    .then( res => res.text() )
    .then( body => {
        try {
          for (const line of body.split('\n'))
          {
            if ( !line.startsWith( '#' ) && line.trim().length > 0 ) {
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
                      // Logic is swapped. public returns a private ip.
                      // TODO: fix when https://github.com/indutny/node-ip/issues/83 is solved.
                      address: ip.address( 'public', 'ipv6' ),
                      ttl: 600
                    }
                  }
                )
            }
          }

          console.log( `[${chalk.blue('ADBLOCK')}] ${chalk.green(data.entries.keys().length)} rules fetched.` )
          resolve()
        } catch (ex) {
          reject(ex)
        }
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