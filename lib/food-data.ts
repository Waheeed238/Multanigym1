export interface Food {
  id: string
  name: string
  category: string
  protein: number // per 100g
  calories: number // per 100g
  fat: number // per 100g
  carbs: number // per 100g
  serving: string
  image: string
}

export const foodDatabase: Food[] = [
  // Proteins
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Protein",
    protein: 31,
    calories: 165,
    fat: 3.6,
    carbs: 0,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
  },
  {
    id: "eggs",
    name: "Eggs (boiled)",
    category: "Protein",
    protein: 13,
    calories: 155,
    fat: 11,
    carbs: 1.1,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400&h=300&fit=crop",
  },
  {
    id: "whey-protein",
    name: "Whey Protein Powder",
    category: "Protein",
    protein: 80,
    calories: 370,
    fat: 3,
    carbs: 10,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop",
  },
  {
    id: "cottage-cheese",
    name: "Cottage Cheese / Paneer",
    category: "Protein",
    protein: 18,
    calories: 265,
    fat: 20,
    carbs: 1.2,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop",
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt (plain)",
    category: "Protein",
    protein: 10,
    calories: 59,
    fat: 0.4,
    carbs: 3.6,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  },

  // Carbohydrates
  {
    id: "brown-rice",
    name: "Brown Rice (cooked)",
    category: "Carbohydrates",
    protein: 2.6,
    calories: 111,
    fat: 0.9,
    carbs: 23,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  },
  {
    id: "oats",
    name: "Oats",
    category: "Carbohydrates",
    protein: 13,
    calories: 389,
    fat: 7,
    carbs: 66,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400&h=300&fit=crop",
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato (boiled)",
    category: "Carbohydrates",
    protein: 1.6,
    calories: 86,
    fat: 0.1,
    carbs: 20,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
  },

  // Healthy Fats
  {
    id: "peanut-butter",
    name: "Peanut Butter",
    category: "Fats",
    protein: 25,
    calories: 588,
    fat: 50,
    carbs: 20,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop",
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "Fats",
    protein: 21,
    calories: 579,
    fat: 50,
    carbs: 22,
    serving: "100g",
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=300&fit=crop",
  },
]

export const foodCategories = ["All", "Protein", "Carbohydrates", "Fats"]
