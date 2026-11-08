export default function ServiceSchema() {
  const services = [
    {
      "@type": "Service",
      "serviceType": "Külastus Papagoi Keskuses",
      "name": "Külastus Papagoi Keskuses",
      "description": "Külastus Papagoi Keskuses koos üle 50 papagoiga. Peremees räägib papagoidest, võimalus neid toita ja pildistada.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Eesti"
      },
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "validFrom": "2015-01-01"
      },
      "duration": "PT1H"
    },
    {
      "@type": "Service",
      "serviceType": "Sünnipäev Papagoi Keskuses",
      "name": "Sünnipäev Papagoi Keskuses",
      "description": "2.5 tunnine sünnipäevaprogramm papagoidega. Tutvustame papagoisid, merisigu, küülikuid ning kameeleone.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "offers": {
        "@type": "Offer",
        "price": "350",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "duration": "PT2H30M"
    },
    {
      "@type": "Service",
      "serviceType": "Üritus papagoidega väljas",
      "name": "Üritus papagoidega väljas",
      "description": "Papagoid tulevad teie juurde. Peremees tutvustab papagoi maailma, kaasas on 2-3 papagoid, jutustamine ja trikid.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "offers": {
        "@type": "Offer",
        "price": "250",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "duration": "PT1H"
    },
    {
      "@type": "Service",
      "serviceType": "VIP külastus",
      "name": "VIP külastus Papagoi Keskuses",
      "description": "Privaatne külastus ainult ühele seltskonnale, 1–20 inimest, kestus ~45 min. Tööpäeviti 10:00–18:00; nädalavahetusel ja riigipühadel kell 10:00 või 18:00. Giidi juhendus, papagoide käest söötmine värske puuviljaga.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "50",
        "highPrice": "225",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "duration": "PT45M"
    },
    {
      "@type": "Service",
      "serviceType": "Grupikülastused",
      "name": "Grupikülastused",
      "description": "Grupikülastused koolidele, lasteaiadele, ettevõtetele ja suurematele perekondadele.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "duration": "PT1H"
    },
    {
      "@type": "Service",
      "serviceType": "Digitaalne kinkekaart",
      "name": "Papagoi Keskuse kinkekaart",
      "description": "Digitaalne kinkekaart Papagoi Keskuse külastuseks. 10 € = 1 külastus. Ideaalse kingituseks sünnipäevaks või juubeliks.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Papagoi Keskus"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Eesti"
      },
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "EUR",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "10",
          "priceCurrency": "EUR",
          "unitText": "külastus"
        },
        "availability": "https://schema.org/InStock"
      }
    }
  ]

  const schema = {
    "@context": "https://schema.org",
    "@graph": services
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
