import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Notion database ID - see tuleb seadistada .env failis
    let DATABASE_ID = process.env.NOTION_PARROTS_DATABASE_ID || ''
    const NOTION_API_KEY = process.env.NOTION_API_KEY

    // Kui Notion API key või database ID puudub, tagastame tühja array
    if (!NOTION_API_KEY || !DATABASE_ID) {
      console.warn('Notion API key või database ID puudub. Tagastame tühja array.')
      return NextResponse.json({ parrots: [] })
    }

    // Formateerime ID'd (eemaldame sidekriipsud, kui need on)
    DATABASE_ID = DATABASE_ID.replace(/-/g, '')
    
    // Esmalt proovime, kas see on database
    let actualDatabaseId = DATABASE_ID
    let notionResponse: any
    
    try {
      // Proovime esmalt, kas see on database
      const dbUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}`
      const dbCheck = await fetch(dbUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      })
      
      if (!dbCheck.ok) {
        // See on page, proovime leida selle child database'i
        const blocksUrl = `https://api.notion.com/v1/blocks/${DATABASE_ID}/children`
        const blocksResponse = await fetch(blocksUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
          },
        })
        
        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json()
          // Otsime database block'i
          const databaseBlock = blocksData.results.find((block: any) => 
            block.type === 'child_database' || block.type === 'database'
          )
          
          if (databaseBlock) {
            actualDatabaseId = databaseBlock.id.replace(/-/g, '')
            console.log('Leitud database ID:', actualDatabaseId)
          } else {
            // Proovime search API'd, et leida database
            const searchUrl = `https://api.notion.com/v1/search`
            const searchResponse = await fetch(searchUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                filter: {
                  property: 'object',
                  value: 'database',
                },
                query: 'Papagoid',
              }),
            })
            
            if (searchResponse.ok) {
              const searchData = await searchResponse.json()
              if (searchData.results && searchData.results.length > 0) {
                actualDatabaseId = searchData.results[0].id.replace(/-/g, '')
                console.log('Leitud database search\'iga:', actualDatabaseId)
              }
            }
          }
        }
      }
      
      // Nüüd kasutame õiget database ID'd
      const queryUrl = `https://api.notion.com/v1/databases/${actualDatabaseId}/query`
      const queryResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [
            {
              property: 'Nimi',
              direction: 'ascending',
            },
          ],
        }),
      })
      
      if (!queryResponse.ok) {
        const errorText = await queryResponse.text()
        const errorData = JSON.parse(errorText)
        
        // Kui error on "does not contain any data sources", siis integration ei ole ühendatud
        if (errorData.message?.includes('data sources') || errorData.message?.includes('accessible by this API bot')) {
          throw new Error('Database ei ole integration\'iga ühendatud. Palun vaadake NOTION_SETUP.md faili juhiseid.')
        }
        
        throw new Error(`Database query viga: ${queryResponse.status} - ${errorText}`)
      }
      
      const data = await queryResponse.json()
      notionResponse = { results: data.results || [] }
      console.log('Leitud', notionResponse.results.length, 'lehte')
    } catch (error: any) {
      console.error('Notion API viga:', error.message)
      throw error
    }

    console.log('Notion API päring õnnestus:', notionResponse.results?.length || 0, 'lehte')

    // Teisendame Notion andmed meie formaati
    const allParrots = notionResponse.results.map((page: any) => {
      const properties = page.properties

      // Võtame välja vajalikud väljad (kohanda vastavalt oma Notion struktuurile)
      // Proovime erinevaid väljanimesid, kuna Notion'is võivad need olla erinevad
      return {
        id: page.id,
        name: properties.Nimi?.title?.[0]?.plain_text || 
              properties.Name?.title?.[0]?.plain_text || 
              'Nimetu',
        species: properties.Liik?.select?.name || 
                 properties.Species?.select?.name || 
                 '',
        image: properties.Pilt?.files?.[0]?.file?.url || 
               properties.Pilt?.files?.[0]?.external?.url || 
               properties.Image?.files?.[0]?.file?.url || 
               properties.Image?.files?.[0]?.external?.url || 
               '',
        age: properties.Vanus?.rich_text?.[0]?.plain_text || 
             properties.Age?.rich_text?.[0]?.plain_text || 
             '',
        personality: properties.Iseloom?.multi_select?.map((item: any) => item.name) || 
                     properties.Personality?.multi_select?.map((item: any) => item.name) || 
                     [],
        story: properties.Lugu?.rich_text?.[0]?.plain_text || 
               properties.Story?.rich_text?.[0]?.plain_text || 
               '',
        shortStory: properties.Lugu?.rich_text?.[0]?.plain_text || 
                    properties['Lugu']?.rich_text?.[0]?.plain_text ||
                    properties.ShortStory?.rich_text?.[0]?.plain_text || 
                    '',
        birthday: properties.Sünnipäev?.date?.start || 
                 properties['Sünnipäev']?.date?.start ||
                 properties.Birthday?.date?.start || 
                 '',
        gender: properties.Sugu?.select?.name || 
                properties['Sugu']?.select?.name ||
                properties.Gender?.select?.name || 
                '',
        favorites: properties.Lemmikud?.multi_select?.map((item: any) => item.name) || 
                   properties.Favorites?.multi_select?.map((item: any) => item.name) || 
                   [],
        sponsorship: {
          // Uus loogika: "Ristiisa" checkbox määrab staatuse
          // Kui checkbox on checked, siis on liitunud programmiga (sponsored)
          // Kui checkbox on unchecked, siis on vaba (available)
          status: (() => {
            // Uus väli: Ristiisa checkbox
            const ristiisaChecked = properties.Ristiisa?.checkbox || 
                                    properties['Ristiisa']?.checkbox || 
                                    false
            
            if (ristiisaChecked) {
              return 'sponsored'
            }
            
            // Fallback vanale loogikale, kui uut välja pole
            const oldStatus = properties.RistiisaStaatus?.select?.name?.toLowerCase() || 
                             properties['Ristiisa staatus']?.select?.name?.toLowerCase()
            
            if (oldStatus) {
              return oldStatus
            }
            
            return 'available'
          })(),
          monthlyAmount: (() => {
            // Uus väli: Ristiisa (Hind)
            const ristiisaHind = properties['Ristiisa (Hind)']?.number || 
                                 properties['Ristiisa(Hind)']?.number ||
                                 properties['Ristiisa Hind']?.number ||
                                 properties.RistiisaHind?.number
            
            if (ristiisaHind !== undefined && ristiisaHind !== null) {
              return `${ristiisaHind}€`
            }
            
            // Fallback vanale väljale
            const kuutasu = properties.Kuutasu?.number || properties['Kuutasu']?.number
            if (kuutasu !== undefined && kuutasu !== null) {
              return `${kuutasu}€`
            }
            
            return ''
          })(),
          sponsorName: properties.RistiisaNimi?.rich_text?.[0]?.plain_text || 
                       properties['Ristiisa nimi']?.rich_text?.[0]?.plain_text || 
                       '',
          needs: properties.Vajadused?.rich_text?.[0]?.plain_text || 
                 properties['Vajadused']?.rich_text?.[0]?.plain_text || 
                 '',
        },
        notionUrl: page.url,
        // Lisame Status välja, et saaksime filtreerida
        // Status võib olla nii "select" kui ka "status" tüüpi
        status: properties.Status?.status?.name || 
                properties.Status?.select?.name || 
                properties.Staatus?.status?.name ||
                properties.Staatus?.select?.name || 
                properties['Status']?.status?.name ||
                properties['Status']?.select?.name ||
                properties['Staatus']?.status?.name ||
                properties['Staatus']?.select?.name ||
                '',
      }
    })
    
    // Debug: näitame kõiki staatusi
    const allStatuses = [...new Set(allParrots.map((p: any) => p.status || 'N/A'))]
    console.log('Kõik leitud staatused:', allStatuses)
    console.log('Kokku papagoisid enne filtreerimist:', allParrots.length)
    
    // AJUTISELT: näitame kõiki papagoisid, et näha, millised staatused on olemas
    // TODO: eemalda see pärast, kui teame õiget väljanime
    if (allParrots.length === 0) {
      console.warn('HOIATUS: Notion\'ist ei tulnud ühtegi papagoid!')
    }
    
    // Filtreerime ainult need, millel on Status = "Kodus" ja pilt lisatud
    const parrots = allParrots.filter((parrot: any) => {
      const status = (parrot.status || '').trim().toLowerCase()
      const hasImage = Boolean(parrot.image && String(parrot.image).trim().length > 0)
      return status === 'kodus' && hasImage
    })
    
    console.log('Papagoisid pärast filtreerimist (Status=Kodus):', parrots.length)

    return NextResponse.json({ parrots })
  } catch (error: any) {
    console.error('Notion API viga:', error)
    
    // Kui on viga, tagastame tühja array, et leht ei katkeks
    // Aga lisame kasuliku veateate
    const errorMessage = error.message || 'Notion API viga'
    
    return NextResponse.json(
      { 
        parrots: [],
        error: errorMessage,
        hint: errorMessage.includes('data sources') || errorMessage.includes('accessible by this API bot')
          ? 'Palun veenduge, et Notion integration on database\'iga ühendatud. Vaadake NOTION_SETUP.md faili.'
          : 'Palun kontrollige, kas NOTION_API_KEY ja NOTION_PARROTS_DATABASE_ID on õigesti seadistatud .env failis.'
      },
      { status: 500 }
    )
  }
}
