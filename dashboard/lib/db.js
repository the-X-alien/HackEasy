import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createUser(email, passwordHash) {
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: passwordHash })
    .select()
    .single()

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      throw new Error('Email already exists')
    }
    throw error
  }
  return { id: data.id, email: data.email }
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, created_at')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getSavedIdeas(userId) {
  const { data, error } = await supabase
    .from('saved_ideas')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })

  if (error) return []
  return data || []
}

export async function saveIdea(userId, idea) {
  const { data, error } = await supabase
    .from('saved_ideas')
    .insert({
      user_id: userId,
      title: idea.title,
      description: idea.description,
      wis_score: idea.wis_score || idea.wis || null,
      pain_score: idea.pain_score || idea.pain || null,
      novelty_score: idea.novelty_score || idea.novelty || null,
      feasibility_score: idea.feasibility_score || idea.feasibility || null,
      alignment_score: idea.alignment_score || idea.alignment || null,
      category: idea.category || '',
      track: idea.track || 'software',
      judging: idea.judging || 'judge-judged'
    })
    .select()
    .single()

  if (error) throw error
  return data.id
}

export async function removeIdea(userId, ideaId) {
  const { error } = await supabase
    .from('saved_ideas')
    .delete()
    .eq('id', ideaId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function clearAllIdeas(userId) {
  const { error } = await supabase
    .from('saved_ideas')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}