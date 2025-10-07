import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { useUser } from '../context/UserContext'
import './DietPlanner.css'

const DietPlanner = () => {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: '',
    symptoms: [],
    healthGoals: [],
    allergies: '',
    dietaryPreferences: ''
  })
  const [dietPlan, setDietPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const symptoms = [
    { id: 'headaches', label: 'Headaches', icon: 'fa-head-side-virus' },
    { id: 'fatigue', label: 'Fatigue', icon: 'fa-battery-quarter' },
    { id: 'period-issues', label: 'Period Issues', icon: 'fa-calendar-alt' },
    { id: 'mood-swings', label: 'Mood Swings', icon: 'fa-face-frown' },
    { id: 'digestive', label: 'Digestive Issues', icon: 'fa-pills' },
    { id: 'skin-problems', label: 'Skin Problems', icon: 'fa-face-sad-tear' },
    { id: 'sleep-issues', label: 'Sleep Issues', icon: 'fa-bed' },
    { id: 'stress', label: 'Stress/Anxiety', icon: 'fa-brain' },
    { id: 'hair-loss', label: 'Hair Loss', icon: 'fa-user-alt-slash' }
  ]

  const healthGoals = [
    { id: 'weight-loss', label: 'Weight Loss', icon: 'fa-weight-scale' },
    { id: 'weight-gain', label: 'Weight Gain', icon: 'fa-dumbbell' },
    { id: 'energy-boost', label: 'Energy Boost', icon: 'fa-bolt' },
    { id: 'better-skin', label: 'Better Skin', icon: 'fa-face-smile' },
    { id: 'hormonal-balance', label: 'Hormonal Balance', icon: 'fa-balance-scale' },
    { id: 'digestive-health', label: 'Digestive Health', icon: 'fa-leaf' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Validation logic for contradictory selections
  const validateSelection = (type, id, currentFormData) => {
    const contradictions = {
      healthGoals: {
        'weight-loss': ['weight-gain'],
        'weight-gain': ['weight-loss']
      },
      symptoms: {
        'period-issues': (formData) => {
          const age = parseInt(formData.age)
          if (age > 55) {
            return 'Period issues are typically not relevant for women over 55 (post-menopause). Please select symptoms more appropriate for your age group.'
          }
          return false
        }
      }
    }

    // Additional complex validations
    const complexValidations = {
      // Check for age-related contradictions
      ageBasedValidation: (formData, type, id) => {
        const age = parseInt(formData.age)
        
        // Elderly users (70+) with certain goals
        if (age >= 70) {
          const unsafeGoals = ['muscle-gain', 'weight-gain']
          if (type === 'healthGoals' && unsafeGoals.includes(id)) {
            return `For users over 70, significant weight or muscle gain goals should be supervised by a healthcare provider. Please consult your doctor before starting any new fitness regimen.`
          }
        }
        
        return false
      },
      
      // Check activity level vs health goals
      activityGoalValidation: (formData, type, id) => {
        if (type === 'healthGoals' && id === 'muscle-gain') {
          if (formData.activityLevel === 'sedentary') {
            return `Muscle gain typically requires regular exercise. Consider selecting a more active lifestyle or changing your health goal to match your current activity level.`
          }
        }
        return false
      }
    }

    // Run basic contradictions check - but skip for weight goals since we handle them automatically
    if (type === 'healthGoals' && contradictions.healthGoals[id]) {
      // Skip validation for weight goals since we handle mutual exclusion automatically
      if (id === 'weight-loss' || id === 'weight-gain') {
        return true // Allow the selection, our handleCheckboxChange will handle the mutual exclusion
      }
      
      const conflictingGoals = contradictions.healthGoals[id]
      const hasConflict = conflictingGoals.some(goal => currentFormData.healthGoals.includes(goal))
      
      if (hasConflict) {
        const currentGoal = healthGoals.find(g => g.id === id)?.label
        const conflictingLabels = conflictingGoals.map(g => healthGoals.find(h => h.id === g)?.label).join(', ')
        alert(`❌ Contradictory Goals: You cannot select both "${currentGoal}" and "${conflictingLabels}" at the same time. Please choose one weight goal that matches your primary objective.`)
        return false
      }
    }

    // Run symptom validations
    if (type === 'symptoms' && contradictions.symptoms[id]) {
      const validator = contradictions.symptoms[id]
      if (typeof validator === 'function') {
        const errorMessage = validator(currentFormData)
        if (errorMessage) {
          alert(`❌ Age Validation: ${errorMessage}`)
          return false
        }
      }
    }

    // Run complex validations
    for (const [validationName, validator] of Object.entries(complexValidations)) {
      const errorMessage = validator(currentFormData, type, id)
      if (errorMessage) {
        alert(`⚠️ Health Advisory: ${errorMessage}`)
        return false
      }
    }

    return true
  }

  const handleCheckboxChange = (type, id) => {
    setFormData(prev => {
      const isCurrentlySelected = prev[type].includes(id)
      
      // If trying to select (not deselect), validate first
      if (!isCurrentlySelected && !validateSelection(type, id, prev)) {
        return prev // Don't change if validation fails
      }

      // Handle mutually exclusive health goals (weight-loss vs weight-gain)
      if (type === 'healthGoals' && !isCurrentlySelected) {
        let updatedGoals = prev[type]
        
        // If selecting weight-loss, remove weight-gain
        if (id === 'weight-loss' && updatedGoals.includes('weight-gain')) {
          updatedGoals = updatedGoals.filter(goal => goal !== 'weight-gain')
        }
        // If selecting weight-gain, remove weight-loss
        else if (id === 'weight-gain' && updatedGoals.includes('weight-loss')) {
          updatedGoals = updatedGoals.filter(goal => goal !== 'weight-loss')
        }
        
        return {
          ...prev,
          [type]: [...updatedGoals, id]
        }
      }

      return {
        ...prev,
        [type]: isCurrentlySelected 
          ? prev[type].filter(item => item !== id)
          : [...prev[type], id]
      }
    })
  }

  const generateDietPlan = async () => {
    setIsLoading(true)
    
    try {
      // Prepare request data for backend
      const requestData = {
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        activityLevel: formData.activityLevel,
        symptoms: formData.symptoms,
        healthGoals: formData.healthGoals,
        allergies: formData.allergies,
        dietaryPreferences: formData.dietaryPreferences
      }
      
      console.log('🔄 Sending request to backend:', requestData)
      
      // Call your backend API
      const response = await fetch('http://localhost:8080/api/diet/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Received response from backend:', result)
      
      if (result.success) {
        // Process the Spoonacular API response
        const processedPlan = {
          dailyCalories: result.calories || result.nutrients?.calories || calculateFallbackCalories(),
          recommendations: generateRecommendations(),
          mealPlan: processMealPlanData(result.meals || []),
          supplements: generateSupplements(),
          spoonacularData: result,
          apiStatus: 'success',
          dataSource: result.fallback ? 'Backend Fallback' : 'Spoonacular API'
        }
        
        console.log('🎯 Generated diet plan with data source:', processedPlan.dataSource)
        setDietPlan(processedPlan)
        
        // Save the diet plan to database
        await saveDietPlan(processedPlan)
        
        // Show success message
        if (!result.fallback) {
          alert('✅ Diet plan generated successfully using Spoonacular API!')
        } else {
          alert('⚠️ Diet plan generated using fallback data (API issue)')
        }
        
      } else {
        throw new Error(result.error || 'Backend returned unsuccessful response')
      }
      
    } catch (error) {
      console.error('❌ Error generating diet plan:', error)
      
      // Show clear error to user
      alert(`❌ API Failed: ${error.message}\n\n🔄 Using offline diet plan instead.`)
      
      // Fallback to your existing sample plan
      const fallbackPlan = {
        dailyCalories: calculateFallbackCalories(),
        recommendations: generateRecommendations(),
        mealPlan: generateMealPlan(),
        supplements: generateSupplements(),
        apiStatus: 'failed',
        dataSource: 'Offline Fallback',
        errorDetails: error.message
      }
      
      console.log('🔄 Using fallback plan due to API error:', fallbackPlan)
      setDietPlan(fallbackPlan)
      
      // Save the fallback plan to database
      await saveDietPlan(fallbackPlan)
    } finally {
      setIsLoading(false)
    }
  }

  // Save diet plan to database
  const saveDietPlan = async (planData) => {
    if (!user) {
      console.log('No user logged in, skipping diet plan save')
      return
    }

    try {
      const dietPlanRequest = {
        userId: user.id,
        userName: user.name || 'User',
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        activityLevel: formData.activityLevel,
        symptoms: formData.symptoms,
        healthGoals: formData.healthGoals,
        allergies: formData.allergies || '',
        dietaryPreferences: formData.dietaryPreferences || '',
        planContent: JSON.stringify(planData),
        caloriesPerDay: planData.dailyCalories || 0
      }

      console.log('🔄 Saving diet plan to database:', dietPlanRequest)
      
      const response = await fetch('http://localhost:8080/api/diet/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dietPlanRequest)
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Diet plan saved successfully to database')
      } else {
        console.error('❌ Failed to save diet plan:', result.message)
      }
      
    } catch (error) {
      console.error('❌ Error saving diet plan:', error)
    }
  }

  const calculateFallbackCalories = () => {
    return Math.round(1200 + (formData.weight * 15) + (formData.activityLevel === 'active' ? 300 : 100))
  }

  const filterAllergenicFoods = (foods, allergies) => {
    if (!allergies) return foods
    
    const allergyString = allergies.toLowerCase()
    
    return foods.filter(food => {
      const foodLower = food.toLowerCase()
      
      // Check for nut allergies
      if ((allergyString.includes('nuts') || allergyString.includes('almond') || 
           allergyString.includes('nut')) && 
          (foodLower.includes('nuts') || foodLower.includes('almond') || 
           foodLower.includes('walnut') || foodLower.includes('cashew') || 
           foodLower.includes('pecan'))) {
        return false
      }
      
      // Check for dairy allergies
      if ((allergyString.includes('dairy') || allergyString.includes('milk') || 
           allergyString.includes('lactose')) && 
          (foodLower.includes('yogurt') || foodLower.includes('cheese') || 
           foodLower.includes('milk') || foodLower.includes('cream'))) {
        return false
      }
      
      // Check for gluten allergies
      if ((allergyString.includes('gluten') || allergyString.includes('wheat')) && 
          (foodLower.includes('bread') || foodLower.includes('pasta') || 
           foodLower.includes('wheat') || foodLower.includes('cereal'))) {
        return false
      }
      
      // Check for seafood allergies
      if ((allergyString.includes('fish') || allergyString.includes('seafood') || 
           allergyString.includes('shellfish')) && 
          (foodLower.includes('salmon') || foodLower.includes('fish') || 
           foodLower.includes('seafood') || foodLower.includes('shrimp'))) {
        return false
      }
      
      // Check for soy allergies
      if (allergyString.includes('soy') && foodLower.includes('tofu')) {
        return false
      }
      
      return true
    })
  }

  const processMealPlanData = (meals) => {
    if (!meals || meals.length === 0) {
      return generateMealPlan() // Fallback to your existing meal plan
    }

    // Group meals by type (you might need to enhance this based on Spoonacular response)
    const processedPlan = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    }

    meals.forEach((meal, index) => {
      const mealTitle = meal.title || 'Healthy Meal Option'
      const mealInfo = `${mealTitle} (${meal.readyInMinutes || 30} mins)`
      
      // Simple distribution - you can make this smarter based on meal types
      if (index === 0) processedPlan.breakfast.push(mealInfo)
      else if (index === 1) processedPlan.lunch.push(mealInfo)
      else if (index === 2) processedPlan.dinner.push(mealInfo)
      else processedPlan.snacks.push(mealInfo)
    })

    // Fill empty categories with your existing options
    if (processedPlan.breakfast.length === 0) {
      processedPlan.breakfast = ['Oatmeal with berries and nuts', 'Greek yogurt with chia seeds']
    }
    if (processedPlan.lunch.length === 0) {
      processedPlan.lunch = ['Quinoa salad with vegetables', 'Lentil soup with whole grain bread']
    }
    if (processedPlan.dinner.length === 0) {
      processedPlan.dinner = ['Grilled salmon with roasted vegetables', 'Bean and vegetable curry']
    }
    if (processedPlan.snacks.length === 0) {
      processedPlan.snacks = ['Mixed nuts and seeds', 'Apple with almond butter']
    }

    return processedPlan
  }

  const generateRecommendations = () => {
    const recommendations = []
    
    if (formData.symptoms.includes('headaches')) {
      recommendations.push({
        title: 'Hydration & Magnesium',
        description: 'Increase water intake to 8-10 glasses daily. Include magnesium-rich foods like spinach, almonds, and dark chocolate.',
        icon: 'fa-tint'
      })
    }
    
    if (formData.symptoms.includes('fatigue')) {
      recommendations.push({
        title: 'Iron & B-Vitamins',
        description: 'Include iron-rich foods like lentils, spinach, and lean meats. Add B-vitamin sources like whole grains and leafy greens.',
        icon: 'fa-battery-full'
      })
    }
    
    if (formData.symptoms.includes('irregular-periods')) {
      recommendations.push({
        title: 'Omega-3 & Healthy Fats',
        description: 'Include fatty fish, walnuts, and flaxseeds. Maintain regular meal times and avoid excessive refined sugars.',
        icon: 'fa-fish'
      })
    }
    
    recommendations.push({
      title: 'Balanced Nutrition',
      description: 'Focus on whole foods, lean proteins, complex carbohydrates, and plenty of colorful vegetables.',
      icon: 'fa-apple-alt'
    })
    
    return recommendations
  }

  const generateMealPlan = () => {
    const baseMealPlan = {
      breakfast: [
        'Steel-cut oats with fresh berries and chia seeds',
        'Greek yogurt parfait with granola and seasonal fruit',
        'Avocado toast on sprouted grain bread with hemp seeds',
        'Green smoothie with spinach, banana, and protein powder',
        'Veggie-packed scrambled eggs with herbs',
        'Overnight chia pudding with almond milk and fruit'
      ],
      lunch: [
        'Rainbow quinoa bowl with roasted vegetables',
        'Lentil and vegetable soup with mixed greens',
        'Grilled chicken breast with sweet potato and steamed broccoli',
        'Buddha bowl with chickpeas, tahini, and fresh vegetables',
        'Wild salmon salad with mixed greens and olive oil dressing',
        'Turkey and vegetable lettuce wraps with brown rice'
      ],
      dinner: [
        'Baked wild salmon with roasted asparagus and quinoa',
        'Lean turkey meatballs with zucchini noodles',
        'Three-bean vegetable curry with cauliflower rice',
        'Grilled tofu stir-fry with colorful vegetables',
        'Herb-crusted chicken with roasted root vegetables',
        'Stuffed bell peppers with lean ground turkey and quinoa'
      ],
      snacks: [
        'Raw almonds and fresh apple slices',
        'Hummus with cucumber and bell pepper strips',
        'Greek yogurt with a drizzle of honey and berries',
        'Homemade trail mix with nuts, seeds, and dried fruit',
        'Avocado on rice cakes with sea salt',
        'Green tea with a small handful of walnuts'
      ]
    }

    // Filter out allergenic foods
    const filteredMealPlan = {
      breakfast: filterAllergenicFoods(baseMealPlan.breakfast, formData.allergies),
      lunch: filterAllergenicFoods(baseMealPlan.lunch, formData.allergies),
      dinner: filterAllergenicFoods(baseMealPlan.dinner, formData.allergies),
      snacks: filterAllergenicFoods(baseMealPlan.snacks, formData.allergies)
    }

    // Add safe alternatives if we filtered out too many options
    if (filteredMealPlan.snacks.length < 2) {
      const safeSnacks = ['Fresh fruit', 'Rice cakes', 'Vegetable sticks with olive oil', 'Smoothie bowl']
      filteredMealPlan.snacks = [...filteredMealPlan.snacks, ...safeSnacks.slice(0, 4 - filteredMealPlan.snacks.length)]
    }

    return filteredMealPlan
  }

  const generateSupplements = () => {
    const supplements = []
    
    // Age-based recommendations
    const age = parseInt(formData.age)
    if (age >= 50) {
      supplements.push({ name: 'Calcium + Vitamin D', dosage: '1000mg + 800 IU daily', reason: 'Bone health support for mature women' })
      supplements.push({ name: 'B12', dosage: '2.4 mcg daily', reason: 'Enhanced absorption needs with age' })
    } else if (age >= 30) {
      supplements.push({ name: 'Vitamin D', dosage: '1000-2000 IU daily', reason: 'General health and immune support' })
    }
    
    // Symptom-based recommendations
    if (formData.symptoms.includes('fatigue')) {
      supplements.push({ name: 'Iron', dosage: 'As recommended by doctor', reason: 'Combat fatigue and support energy levels' })
      supplements.push({ name: 'Vitamin B Complex', dosage: '1 tablet daily', reason: 'Energy metabolism support' })
    }
    
    if (formData.symptoms.includes('irregular-periods')) {
      supplements.push({ name: 'Omega-3', dosage: '1000mg daily', reason: 'Hormonal balance and inflammation reduction' })
      supplements.push({ name: 'Magnesium', dosage: '200-400mg daily', reason: 'Hormonal regulation and cramp relief' })
    }
    
    if (formData.symptoms.includes('mood-swings')) {
      supplements.push({ name: 'Omega-3', dosage: '1000mg daily', reason: 'Mood stabilization and brain health' })
      supplements.push({ name: 'Vitamin D', dosage: '2000 IU daily', reason: 'Mood regulation support' })
    }
    
    if (formData.symptoms.includes('digestive-issues')) {
      supplements.push({ name: 'Probiotics', dosage: '10-50 billion CFU daily', reason: 'Digestive health and gut microbiome' })
      supplements.push({ name: 'Digestive Enzymes', dosage: 'With meals as needed', reason: 'Improve nutrient absorption' })
    }
    
    if (formData.symptoms.includes('joint-pain')) {
      supplements.push({ name: 'Glucosamine + Chondroitin', dosage: '1500mg + 1200mg daily', reason: 'Joint health and cartilage support' })
      supplements.push({ name: 'Turmeric/Curcumin', dosage: '500-1000mg daily', reason: 'Anti-inflammatory support' })
    }
    
    // Health goal-based recommendations
    if (formData.healthGoals.includes('weight-loss')) {
      supplements.push({ name: 'Green Tea Extract', dosage: '300-400mg daily', reason: 'Metabolism boost and fat oxidation' })
      supplements.push({ name: 'Chromium', dosage: '200 mcg daily', reason: 'Blood sugar and appetite regulation' })
    }
    
    if (formData.healthGoals.includes('muscle-gain')) {
      supplements.push({ name: 'Whey Protein', dosage: '20-30g post-workout', reason: 'Muscle building and recovery' })
      supplements.push({ name: 'Creatine', dosage: '3-5g daily', reason: 'Strength and muscle development' })
    }
    
    if (formData.healthGoals.includes('better-skin')) {
      supplements.push({ name: 'Collagen', dosage: '10g daily', reason: 'Skin elasticity and hydration' })
      supplements.push({ name: 'Vitamin C', dosage: '1000mg daily', reason: 'Collagen synthesis and antioxidant protection' })
    }
    
    // Activity level considerations
    if (formData.activityLevel === 'active' || formData.activityLevel === 'very-active') {
      supplements.push({ name: 'Electrolyte Supplement', dosage: 'During/after workouts', reason: 'Hydration and muscle function' })
      supplements.push({ name: 'Magnesium', dosage: '300-400mg daily', reason: 'Muscle recovery and sleep quality' })
    }
    
    // Dietary preference considerations
    if (formData.dietaryPreferences === 'vegetarian' || formData.dietaryPreferences === 'vegan') {
      supplements.push({ name: 'B12', dosage: '2.4 mcg daily', reason: 'Essential for plant-based diets' })
      supplements.push({ name: 'Iron', dosage: 'As recommended by doctor', reason: 'Plant-based iron absorption support' })
      if (formData.dietaryPreferences === 'vegan') {
        supplements.push({ name: 'Algae-based Omega-3', dosage: '300mg DHA + EPA daily', reason: 'Vegan-friendly essential fatty acids' })
      }
    }
    
    // Remove duplicates and limit to most relevant
    const uniqueSupplements = supplements.filter((supplement, index, self) =>
      index === self.findIndex(s => s.name === supplement.name)
    )
    
    // Always include a basic multivitamin if no specific supplements were added
    if (uniqueSupplements.length === 0) {
      uniqueSupplements.push({ name: 'Women\'s Multivitamin', dosage: 'As directed', reason: 'General nutritional insurance' })
    }
    
    return uniqueSupplements.slice(0, 6) // Limit to 6 most relevant supplements
  }

  // Final validation before form submission
  const validateFormData = (formData) => {
    const errors = []

    // Check for required fields
    if (!formData.age || formData.age < 12 || formData.age > 100) {
      errors.push('Please enter a valid age between 12 and 100.')
    }

    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      errors.push('Please enter a valid weight between 30 and 300 kg.')
    }

    if (!formData.height || formData.height < 100 || formData.height > 250) {
      errors.push('Please enter a valid height between 100 and 250 cm.')
    }

    // Check for contradictory health goals
    const hasWeightLoss = formData.healthGoals.includes('weight-loss')
    const hasWeightGain = formData.healthGoals.includes('weight-gain')
    if (hasWeightLoss && hasWeightGain) {
      errors.push('You cannot have both weight loss and weight gain as goals. Please choose one.')
    }

    // Age-specific validations
    const age = parseInt(formData.age)
    if (age > 55 && formData.symptoms.includes('period-issues')) {
      errors.push('Period issues are not typically relevant for women over 55. Please review your symptom selections.')
    }

    // Activity and goal compatibility
    if (formData.activityLevel === 'sedentary' && formData.healthGoals.includes('muscle-gain')) {
      errors.push('Muscle gain goals typically require regular physical activity. Consider adjusting your activity level or health goals.')
    }

    // Check for reasonable selections
    if (formData.symptoms.length === 0 && formData.healthGoals.length === 0) {
      errors.push('Please select at least one symptom or health goal to get personalized recommendations.')
    }

    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate form data before submission
    const validationErrors = validateFormData(formData)
    
    if (validationErrors.length > 0) {
      const errorMessage = '⚠️ Please correct the following issues:\n\n' + validationErrors.map((error, index) => `${index + 1}. ${error}`).join('\n')
      alert(errorMessage)
      return
    }
    
    generateDietPlan()
  }

  const downloadPDF = async () => {
    // Generate automatic filename with timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')
    const dateStr = timestamp[0] // YYYY-MM-DD
    const timeStr = timestamp[1].split('.')[0] // HH-MM-SS
    const fileName = `Maitri_Diet_Plan_${dateStr}_${timeStr}.pdf`

    // Create a new PDF document
    const doc = new jsPDF()
    
    // Set up fonts and colors
    const primaryColor = [233, 30, 99] // Pink color for headings
    const textColor = [44, 62, 80] // Dark text color
    
    let yPosition = 20
    const lineHeight = 6
    const pageWidth = doc.internal.pageSize.width
    const leftMargin = 20
    const rightMargin = 20
    const contentWidth = pageWidth - leftMargin - rightMargin

    // Helper function to add text with word wrapping
    const addWrappedText = (text, x, y, maxWidth, fontSize = 10, color = textColor) => {
      doc.setFontSize(fontSize)
      doc.setTextColor(...color)
      const lines = doc.splitTextToSize(text, maxWidth)
      lines.forEach((line, index) => {
        if (y + (index * lineHeight) > 280) { // Check if we need a new page
          doc.addPage()
          y = 20
        }
        doc.text(line, x, y + (index * lineHeight))
      })
      return y + (lines.length * lineHeight)
    }

    // Helper function to add section header
    const addSectionHeader = (title, y) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.setFont(undefined, 'bold')
      doc.text(title, leftMargin, y)
      doc.setFont(undefined, 'normal')
      return y + 10
    }

    // Title
    doc.setFontSize(20)
    doc.setTextColor(...primaryColor)
    doc.setFont(undefined, 'bold')
    doc.text('MAITRI PERSONALIZED DIET PLAN', leftMargin, yPosition)
    yPosition += 15

    // Subtitle
    doc.setFontSize(12)
    doc.setTextColor(...textColor)
    doc.setFont(undefined, 'normal')
    yPosition = addWrappedText(`Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, leftMargin, yPosition, contentWidth, 12)
    yPosition += 10

    // Daily Calorie Target
    yPosition = addSectionHeader('DAILY CALORIE TARGET', yPosition)
    yPosition = addWrappedText(`${dietPlan.dailyCalories} calories per day`, leftMargin, yPosition, contentWidth, 12, primaryColor)
    yPosition += 10

    // Personal Information
    yPosition = addSectionHeader('PERSONAL INFORMATION', yPosition)
    const personalInfo = [
      `Age: ${formData.age} years`,
      `Weight: ${formData.weight} kg`,
      `Height: ${formData.height} cm`,
      `Activity Level: ${formData.activityLevel.charAt(0).toUpperCase() + formData.activityLevel.slice(1)}`
    ]
    personalInfo.forEach(info => {
      yPosition = addWrappedText(`• ${info}`, leftMargin, yPosition, contentWidth)
      yPosition += 2
    })
    yPosition += 5

    // Selected Symptoms
    yPosition = addSectionHeader('SELECTED SYMPTOMS', yPosition)
    if (formData.symptoms.length > 0) {
      formData.symptoms.forEach(symptom => {
        const symptomObj = symptoms.find(s => s.id === symptom)
        yPosition = addWrappedText(`• ${symptomObj?.label || symptom}`, leftMargin, yPosition, contentWidth)
        yPosition += 2
      })
    } else {
      yPosition = addWrappedText('• None selected', leftMargin, yPosition, contentWidth)
    }
    yPosition += 5

    // Health Goals
    yPosition = addSectionHeader('HEALTH GOALS', yPosition)
    if (formData.healthGoals.length > 0) {
      formData.healthGoals.forEach(goal => {
        const goalObj = healthGoals.find(g => g.id === goal)
        yPosition = addWrappedText(`• ${goalObj?.label || goal}`, leftMargin, yPosition, contentWidth)
        yPosition += 2
      })
    } else {
      yPosition = addWrappedText('• None selected', leftMargin, yPosition, contentWidth)
    }
    yPosition += 5

    // Dietary Preferences
    yPosition = addSectionHeader('DIETARY PREFERENCES', yPosition)
    yPosition = addWrappedText(`Diet Type: ${formData.dietaryPreferences ? formData.dietaryPreferences.charAt(0).toUpperCase() + formData.dietaryPreferences.slice(1) : 'Not specified'}`, leftMargin, yPosition, contentWidth)
    yPosition += 2
    yPosition = addWrappedText(`Allergies/Intolerances: ${formData.allergies || 'None specified'}`, leftMargin, yPosition, contentWidth)
    yPosition += 10

    // Recommendations
    yPosition = addSectionHeader('PERSONALIZED RECOMMENDATIONS', yPosition)
    dietPlan.recommendations.forEach((rec, index) => {
      yPosition = addWrappedText(`${index + 1}. ${rec.title}`, leftMargin, yPosition, contentWidth, 11, primaryColor)
      yPosition += 2
      yPosition = addWrappedText(`   ${rec.description}`, leftMargin, yPosition, contentWidth)
      yPosition += 5
    })

    // Sample Meal Plan
    yPosition = addSectionHeader('SAMPLE MEAL PLAN', yPosition)
    
    const mealTypes = [
      { key: 'breakfast', label: 'BREAKFAST' },
      { key: 'lunch', label: 'LUNCH' },
      { key: 'dinner', label: 'DINNER' },
      { key: 'snacks', label: 'SNACKS' }
    ]

    mealTypes.forEach(mealType => {
      yPosition = addWrappedText(mealType.label + ':', leftMargin, yPosition, contentWidth, 11, primaryColor)
      yPosition += 2
      dietPlan.mealPlan[mealType.key].forEach(meal => {
        yPosition = addWrappedText(`• ${meal}`, leftMargin, yPosition, contentWidth)
        yPosition += 2
      })
      yPosition += 3
    })

    // Recommended Supplements
    yPosition = addSectionHeader('RECOMMENDED SUPPLEMENTS', yPosition)
    dietPlan.supplements.forEach((supplement, index) => {
      yPosition = addWrappedText(`${index + 1}. ${supplement.name}`, leftMargin, yPosition, contentWidth, 11, primaryColor)
      yPosition += 2
      yPosition = addWrappedText(`   Dosage: ${supplement.dosage}`, leftMargin, yPosition, contentWidth)
      yPosition += 2
      yPosition = addWrappedText(`   Reason: ${supplement.reason}`, leftMargin, yPosition, contentWidth)
      yPosition += 5
    })

    // Important Notes
    yPosition = addSectionHeader('IMPORTANT NOTES', yPosition)
    const notes = [
      'This diet plan is generated based on the information you provided',
      'Please consult with a healthcare professional before making significant dietary changes',
      'Individual nutritional needs may vary',
      'Monitor your body\'s response and adjust as needed'
    ]
    notes.forEach(note => {
      yPosition = addWrappedText(`• ${note}`, leftMargin, yPosition, contentWidth)
      yPosition += 3
    })

    // Footer
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Generated by Maitri Health Platform', leftMargin, yPosition)
    doc.text(`${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - rightMargin - 30, yPosition)

    // Generate PDF as blob
    const pdfBlob = doc.output('blob')

    // Try to use File System Access API for choosing location (modern browsers)
    try {
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'PDF files',
              accept: {
                'application/pdf': ['.pdf'],
              },
            },
          ],
        })
        
        const writable = await fileHandle.createWritable()
        await writable.write(pdfBlob)
        await writable.close()
        
        alert('Diet plan saved successfully to your chosen location!')
        return
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error saving file:', error)
      } else {
        // User cancelled the save dialog
        return
      }
    }

    // Fallback: Use traditional download method for browsers that don't support File System Access API
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    alert('Diet plan downloaded successfully!')
  }

  return (
    <>
      {/* Header Section */}
      <section className="diet-header">
        <div className="container">
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-4">Personalized <span className="text-pink">Diet Planner</span></h1>
            <p className="lead">Get customized nutrition recommendations based on your symptoms and health needs</p>
          </div>
        </div>
      </section>

      {/* Diet Planner Form */}
      <section className="diet-form-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {!dietPlan ? (
                <div className="diet-form-card">
                  <div className="form-header text-center mb-4">
                    <i className="fas fa-utensils fa-3x text-pink mb-3"></i>
                    <h3>Tell us about your health</h3>
                    <p className="text-muted">We'll create a personalized diet plan for you</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className="form-section">
                      <h5 className="section-title">
                        <i className="fas fa-user-circle me-2"></i>Basic Information
                      </h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="age" className="form-label">Age</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            min="13" 
                            max="100" 
                            required 
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="weight" className="form-label">Weight (kg)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            min="30" 
                            max="200" 
                            step="0.1" 
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="height" className="form-label">Height (cm)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            min="120" 
                            max="220" 
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="activityLevel" className="form-label">Activity Level</label>
                          <select 
                            className="form-select" 
                            name="activityLevel"
                            value={formData.activityLevel}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select activity level</option>
                            <option value="sedentary">Sedentary (Little/No exercise)</option>
                            <option value="light">Light (1-3 days/week)</option>
                            <option value="moderate">Moderate (3-5 days/week)</option>
                            <option value="very">Very Active (6-7 days/week)</option>
                            <option value="extra">Extremely Active (2x/day)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Current Symptoms */}
                    <div className="form-section">
                      <h5 className="section-title">
                        <i className="fas fa-heartbeat me-2"></i>Current Symptoms
                      </h5>
                      <p className="text-muted mb-3">Select any symptoms you're currently experiencing:</p>
                      <div className="symptoms-grid">
                        {symptoms.map(symptom => (
                          <div 
                            key={symptom.id} 
                            className={`symptom-card ${formData.symptoms.includes(symptom.id) ? 'selected' : ''}`}
                            onClick={() => handleCheckboxChange('symptoms', symptom.id)}
                          >
                            <i className={`fas ${symptom.icon}`}></i>
                            <span>{symptom.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Preferences */}
                    <div className="form-section">
                      <h5 className="section-title">
                        <i className="fas fa-leaf me-2"></i>Dietary Preferences
                      </h5>
                      <div className="mb-3">
                        <label htmlFor="dietType" className="form-label">Diet Type</label>
                        <select 
                          className="form-select" 
                          name="dietaryPreferences"
                          value={formData.dietaryPreferences}
                          onChange={handleInputChange}
                        >
                          <option value="omnivore">Omnivore (No restrictions)</option>
                          <option value="vegetarian">Vegetarian</option>
                          <option value="vegan">Vegan</option>
                          <option value="keto">Keto</option>
                          <option value="paleo">Paleo</option>
                          <option value="mediterranean">Mediterranean</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="allergies" className="form-label">Food Allergies/Intolerances</label>
                        <textarea 
                          className="form-control" 
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          rows="3" 
                          placeholder="List any food allergies or intolerances (e.g., nuts, dairy, gluten)"
                        ></textarea>
                      </div>
                    </div>

                    {/* Health Goals */}
                    <div className="form-section">
                      <h5 className="section-title">
                        <i className="fas fa-target me-2"></i>Health Goals
                      </h5>
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Note: Weight Loss and Weight Gain are mutually exclusive - selecting one will deselect the other.
                        </small>
                      </div>
                      <div className="goals-grid">
                        {healthGoals.map(goal => (
                          <div 
                            key={goal.id} 
                            className={`goal-card ${formData.healthGoals.includes(goal.id) ? 'selected' : ''}`}
                            onClick={() => handleCheckboxChange('healthGoals', goal.id)}
                          >
                            <i className={`fas ${goal.icon}`}></i>
                            <span>{goal.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center">
                      <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating Your Plan...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-magic me-2"></i>
                            Generate My Diet Plan
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Diet Plan Results
                <div className="diet-results">
                  <div className="results-header text-center mb-4">
                    <h3 className="text-pink">Your Personalized Diet Plan</h3>
                    <p className="text-muted">Based on your health profile and goals</p>
                    
                    {/* Data Source Indicator */}
                    {dietPlan.dataSource && (
                      <div className="alert data-source-alert mt-2">
                        <small>
                          <i className={`fas ${dietPlan.apiStatus === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-1`}></i>
                          <strong>Data Source:</strong> {dietPlan.dataSource}
                          {dietPlan.errorDetails && (
                            <><br />
                            <span className="text-muted">Error: {dietPlan.errorDetails}</span></>
                          )}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Daily Calories */}
                  <div className="calories-card mb-4">
                    <div className="text-center">
                      <h4>Daily Calorie Target</h4>
                      <div className="calorie-number">{dietPlan.dailyCalories}</div>
                      <p className="text-muted">calories per day</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="recommendations-section mb-4">
                    <h5><i className="fas fa-lightbulb me-2 text-pink"></i>Personalized Recommendations</h5>
                    <div className="row">
                      {dietPlan.recommendations.map((rec, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="recommendation-card">
                            <div className="d-flex align-items-start">
                              <i className={`fas ${rec.icon} fa-2x text-pink me-3`}></i>
                              <div>
                                <h6>{rec.title}</h6>
                                <p className="mb-0">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal Plan */}
                  <div className="meal-plan-section mb-4">
                    <h5><i className="fas fa-utensils me-2 text-pink"></i>Sample Meal Ideas</h5>
                    <div className="row">
                      {Object.entries(dietPlan.mealPlan).map(([mealType, meals]) => (
                        <div key={mealType} className="col-md-6 mb-4">
                          <div className="meal-card">
                            <h6 className="text-capitalize text-pink">{mealType}</h6>
                            <ul className="meal-list">
                              {meals.map((meal, index) => (
                                <li key={index}>{meal}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplements */}
                  <div className="supplements-section mb-4">
                    <h5><i className="fas fa-pills me-2 text-pink"></i>Recommended Supplements</h5>
                    <div className="row">
                      {dietPlan.supplements.map((supplement, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="supplement-card">
                            <h6>{supplement.name}</h6>
                            <p className="mb-1"><strong>Dosage:</strong> {supplement.dosage}</p>
                            <p className="mb-0 text-muted">{supplement.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button 
                      className="btn btn-outline-primary me-3" 
                      onClick={() => setDietPlan(null)}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Create New Plan
                    </button>
                    <button className="btn btn-primary" onClick={downloadPDF}>
                      <i className="fas fa-download me-2"></i>
                      Download Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default DietPlanner
