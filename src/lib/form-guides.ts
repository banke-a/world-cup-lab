export type FormGuideMatch = {
  date: string;
  opponent: string;
  result: "W" | "D" | "L";
  goals_for: number;
  goals_against: number;
  tournament: string;
};

export type TeamFormGuide = {
  team_name: string;
  form_guide: string;
  matches: FormGuideMatch[];
};

export const teamFormGuides: TeamFormGuide[] = [
  {
    "team_name": "Brazil",
    "form_guide": "W-W-L-D-W",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Panama",
        "result": "W",
        "goals_for": 6,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Croatia",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-26",
        "opponent": "France",
        "result": "L",
        "goals_for": 1,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Tunisia",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "Senegal",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Germany",
    "form_guide": "W-W-W-W-W",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Finland",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-30",
        "opponent": "Ghana",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Switzerland",
        "result": "W",
        "goals_for": 4,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-17",
        "opponent": "Slovakia",
        "result": "W",
        "goals_for": 6,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-14",
        "opponent": "Luxembourg",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Italy",
    "form_guide": "D-W-L-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Bosnia and Herzegovina",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2026-03-26",
        "opponent": "Northern Ireland",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-16",
        "opponent": "Norway",
        "result": "L",
        "goals_for": 1,
        "goals_against": 4,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "Moldova",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-14",
        "opponent": "Israel",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Argentina",
    "form_guide": "W-W-W-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Zambia",
        "result": "W",
        "goals_for": 5,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Mauritania",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-14",
        "opponent": "Angola",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-10-14",
        "opponent": "Puerto Rico",
        "result": "W",
        "goals_for": 6,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-10-10",
        "opponent": "Venezuela",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "France",
    "form_guide": "W-W-W-W-D",
    "matches": [
      {
        "date": "2026-03-29",
        "opponent": "Colombia",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-26",
        "opponent": "Brazil",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-16",
        "opponent": "Azerbaijan",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "Ukraine",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-13",
        "opponent": "Iceland",
        "result": "D",
        "goals_for": 2,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Uruguay",
    "form_guide": "D-D-L-D-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Algeria",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "England",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "United States",
        "result": "L",
        "goals_for": 1,
        "goals_against": 5,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "Mexico",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-10-13",
        "opponent": "Uzbekistan",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "England",
    "form_guide": "L-D-W-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Japan",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Uruguay",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-16",
        "opponent": "Albania",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "Serbia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-14",
        "opponent": "Latvia",
        "result": "W",
        "goals_for": 5,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Spain",
    "form_guide": "D-W-D-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Egypt",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Serbia",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Turkey",
        "result": "D",
        "goals_for": 2,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Georgia",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-14",
        "opponent": "Bulgaria",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Netherlands",
    "form_guide": "D-W-W-D-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Ecuador",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Norway",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-17",
        "opponent": "Lithuania",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-14",
        "opponent": "Poland",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-12",
        "opponent": "Finland",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Sweden",
    "form_guide": "L-W-W-D-L",
    "matches": [
      {
        "date": "2026-06-01",
        "opponent": "Norway",
        "result": "L",
        "goals_for": 1,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Poland",
        "result": "W",
        "goals_for": 3,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2026-03-26",
        "opponent": "Ukraine",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-18",
        "opponent": "Slovenia",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Switzerland",
        "result": "L",
        "goals_for": 1,
        "goals_against": 4,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Mexico",
    "form_guide": "W-W-D-D-W",
    "matches": [
      {
        "date": "2026-05-30",
        "opponent": "Australia",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-05-22",
        "opponent": "Ghana",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Belgium",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Portugal",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-02-25",
        "opponent": "Iceland",
        "result": "W",
        "goals_for": 4,
        "goals_against": 0,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Belgium",
    "form_guide": "D-W-W-D-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Mexico",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "United States",
        "result": "W",
        "goals_for": 5,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Liechtenstein",
        "result": "W",
        "goals_for": 7,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Kazakhstan",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-13",
        "opponent": "Wales",
        "result": "W",
        "goals_for": 4,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Hungary",
    "form_guide": "D-W-L-W-D",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Greece",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Slovenia",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-16",
        "opponent": "Republic of Ireland",
        "result": "L",
        "goals_for": 2,
        "goals_against": 3,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "Armenia",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-14",
        "opponent": "Portugal",
        "result": "D",
        "goals_for": 2,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Serbia",
    "form_guide": "L-W-L-W-L",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Cape Verde",
        "result": "L",
        "goals_for": 0,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Saudi Arabia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Spain",
        "result": "L",
        "goals_for": 0,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-16",
        "opponent": "Latvia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "England",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Czechoslovakia",
    "form_guide": "D-W-D-W-W",
    "matches": [
      {
        "date": "1993-11-17",
        "opponent": "Belgium",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "1993-10-27",
        "opponent": "Cyprus",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "1993-09-08",
        "opponent": "Wales",
        "result": "D",
        "goals_for": 2,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "1993-06-16",
        "opponent": "Faroe Islands",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "1993-06-02",
        "opponent": "Romania",
        "result": "W",
        "goals_for": 5,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Russia",
    "form_guide": "L-D-W-L-D",
    "matches": [
      {
        "date": "2026-05-28",
        "opponent": "Egypt",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Mali",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Nicaragua",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "Chile",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-12",
        "opponent": "Peru",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Switzerland",
    "form_guide": "W-D-L-D-W",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Jordan",
        "result": "W",
        "goals_for": 4,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Norway",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Germany",
        "result": "L",
        "goals_for": 3,
        "goals_against": 4,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Kosovo",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Sweden",
        "result": "W",
        "goals_for": 4,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Poland",
    "form_guide": "L-L-W-W-D",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Ukraine",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Sweden",
        "result": "L",
        "goals_for": 2,
        "goals_against": 3,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2026-03-26",
        "opponent": "Albania",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-17",
        "opponent": "Malta",
        "result": "W",
        "goals_for": 3,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-14",
        "opponent": "Netherlands",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "United States",
    "form_guide": "W-L-L-W-W",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Senegal",
        "result": "W",
        "goals_for": 3,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Portugal",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Belgium",
        "result": "L",
        "goals_for": 2,
        "goals_against": 5,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Uruguay",
        "result": "W",
        "goals_for": 5,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "Paraguay",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Croatia",
    "form_guide": "L-W-W-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Brazil",
        "result": "L",
        "goals_for": 1,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-26",
        "opponent": "Colombia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-17",
        "opponent": "Montenegro",
        "result": "W",
        "goals_for": 3,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-14",
        "opponent": "Faroe Islands",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-12",
        "opponent": "Gibraltar",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Portugal",
    "form_guide": "W-D-W-L-D",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "United States",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Mexico",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-16",
        "opponent": "Armenia",
        "result": "W",
        "goals_for": 9,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-13",
        "opponent": "Republic of Ireland",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-14",
        "opponent": "Hungary",
        "result": "D",
        "goals_for": 2,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "South Korea",
    "form_guide": "W-L-L-W-W",
    "matches": [
      {
        "date": "2026-05-30",
        "opponent": "Trinidad and Tobago",
        "result": "W",
        "goals_for": 5,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Austria",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Ivory Coast",
        "result": "L",
        "goals_for": 0,
        "goals_against": 4,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Ghana",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-14",
        "opponent": "Bolivia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Chile",
    "form_guide": "L-W-W-W-W",
    "matches": [
      {
        "date": "2026-03-30",
        "opponent": "New Zealand",
        "result": "L",
        "goals_for": 1,
        "goals_against": 4,
        "tournament": "FIFA Series"
      },
      {
        "date": "2026-03-27",
        "opponent": "Cape Verde",
        "result": "W",
        "goals_for": 4,
        "goals_against": 2,
        "tournament": "FIFA Series"
      },
      {
        "date": "2025-11-18",
        "opponent": "Peru",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "Russia",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-10-10",
        "opponent": "Peru",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Austria",
    "form_guide": "W-W-W-D-W",
    "matches": [
      {
        "date": "2026-06-01",
        "opponent": "Tunisia",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "South Korea",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Ghana",
        "result": "W",
        "goals_for": 5,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Bosnia and Herzegovina",
        "result": "D",
        "goals_for": 1,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Cyprus",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Paraguay",
    "form_guide": "L-W-W-L-L",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Morocco",
        "result": "L",
        "goals_for": 1,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-27",
        "opponent": "Greece",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Mexico",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "United States",
        "result": "L",
        "goals_for": 1,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-10-14",
        "opponent": "South Korea",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Romania",
    "form_guide": "L-L-W-L-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "Slovakia",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-26",
        "opponent": "Turkey",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-18",
        "opponent": "San Marino",
        "result": "W",
        "goals_for": 7,
        "goals_against": 1,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Bosnia and Herzegovina",
        "result": "L",
        "goals_for": 1,
        "goals_against": 3,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-10-12",
        "opponent": "Austria",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Cameroon",
    "form_guide": "W-L-L-W-W",
    "matches": [
      {
        "date": "2026-03-31",
        "opponent": "China PR",
        "result": "W",
        "goals_for": 2,
        "goals_against": 0,
        "tournament": "FIFA Series"
      },
      {
        "date": "2026-03-27",
        "opponent": "Australia",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "FIFA Series"
      },
      {
        "date": "2026-01-09",
        "opponent": "Morocco",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "African Cup of Nations"
      },
      {
        "date": "2026-01-04",
        "opponent": "South Africa",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "African Cup of Nations"
      },
      {
        "date": "2025-12-31",
        "opponent": "Mozambique",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "African Cup of Nations"
      }
    ]
  },
  {
    "team_name": "Scotland",
    "form_guide": "W-L-L-W-L",
    "matches": [
      {
        "date": "2026-05-30",
        "opponent": "Curaçao",
        "result": "W",
        "goals_for": 4,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "Ivory Coast",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Japan",
        "result": "L",
        "goals_for": 0,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Denmark",
        "result": "W",
        "goals_for": 4,
        "goals_against": 2,
        "tournament": "FIFA World Cup qualification"
      },
      {
        "date": "2025-11-15",
        "opponent": "Greece",
        "result": "L",
        "goals_for": 2,
        "goals_against": 3,
        "tournament": "FIFA World Cup qualification"
      }
    ]
  },
  {
    "team_name": "Japan",
    "form_guide": "W-W-W-L-D",
    "matches": [
      {
        "date": "2026-05-31",
        "opponent": "Iceland",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-31",
        "opponent": "England",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-28",
        "opponent": "Scotland",
        "result": "W",
        "goals_for": 1,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-09-09",
        "opponent": "United States",
        "result": "L",
        "goals_for": 0,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-09-06",
        "opponent": "Mexico",
        "result": "D",
        "goals_for": 0,
        "goals_against": 0,
        "tournament": "Friendly"
      }
    ]
  },
  {
    "team_name": "Colombia",
    "form_guide": "W-L-L-W-W",
    "matches": [
      {
        "date": "2026-06-01",
        "opponent": "Costa Rica",
        "result": "W",
        "goals_for": 3,
        "goals_against": 1,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-29",
        "opponent": "France",
        "result": "L",
        "goals_for": 1,
        "goals_against": 3,
        "tournament": "Friendly"
      },
      {
        "date": "2026-03-26",
        "opponent": "Croatia",
        "result": "L",
        "goals_for": 1,
        "goals_against": 2,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-18",
        "opponent": "Australia",
        "result": "W",
        "goals_for": 3,
        "goals_against": 0,
        "tournament": "Friendly"
      },
      {
        "date": "2025-11-15",
        "opponent": "New Zealand",
        "result": "W",
        "goals_for": 2,
        "goals_against": 1,
        "tournament": "Friendly"
      }
    ]
  }
];
