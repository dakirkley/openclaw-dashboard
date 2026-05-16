/**
 * Sync Skill with Activity Logging
 * 
 * This skill synchronizes bots, skills, and APIs to Supabase
 * and logs all activities to the activity_log table.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mskqrinkpmikoicsivio.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za3FyaW5rcG1pa29pY3NpdmlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc2OTcxNiwiZXhwIjoyMDkzMzQ1NzE2fQ.QpdomV0x2JqmmGszoDqmQiYVSpaQ6Pv90MdubSLDebI';

const openclawDir = path.join(os.homedir(), '.openclaw');
const skillsDir = path.join(openclawDir, 'skills');

/**
 * Make a request to Supabase REST API
 */
function supabaseRequest(table, method, data = null, query = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${table}${query}`, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : ''
      }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ data: parsed, error: null, status: res.statusCode });
        } catch (e) {
          resolve({ data: responseData, error: null, status: res.statusCode });
        }
      });
    });
    req.on('error', (err) => reject(err));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Log an activity to the activity_log table
 */
async function logActivity(businessId, action, entityType, entityName, details = {}, status = 'success') {
  try {
    const result = await supabaseRequest('activity_log', 'POST', {
      business_id: businessId,
      action,
      entity_type: entityType,
      entity_name: entityName,
      details,
      status
    });
    
    if (result.error) {
      console.error('Failed to log activity:', result.error);
    } else {
      console.log(`✓ Logged: ${action} ${entityType} - ${entityName}`);
    }
    
    return result;
  } catch (err) {
    console.error('Error logging activity:', err.message);
    return { error: err.message };
  }
}

/**
 * Get or create a business by name
 */
async function getOrCreateBusiness(businessName) {
  // Try to find existing business
  const { data: existing, error } = await supabaseRequest(
    'businesses',
    'GET',
    null,
    `?name=eq.${encodeURIComponent(businessName)}`
  );
  
  if (existing && existing.length > 0) {
    console.log(`Found existing business: ${businessName} (${existing[0].id})`);
    return existing[0];
  }
  
  // Create new business
  console.log(`Creating new business: ${businessName}`);
  const { data: newBusiness, error: createError } = await supabaseRequest('businesses', 'POST', {
    name: businessName,
    description: 'Auto-created during sync',
    color: '#0ea5e9'
  });
  
  if (createError) {
    throw new Error(`Failed to create business: ${createError.message}`);
  }
  
  console.log(`✓ Created business: ${businessName} (${newBusiness[0].id})`);
  
  // Log the creation
  await logActivity(
    newBusiness[0].id,
    'add',
    'business',
    businessName,
    { message: 'Business created during sync' }
  );
  
  return newBusiness[0];
}

/**
 * Sync skills to Supabase
 */
async function syncSkills(businessId) {
  console.log('\n--- Syncing Skills ---');
  
  const skills = [];
  
  if (!fs.existsSync(skillsDir)) {
    console.log('Skills directory not found');
    return { count: 0, skills: [] };
  }
  
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillJsonPath = path.join(skillsDir, entry.name, 'skill.json');
      
      let skillData = {
        name: entry.name,
        version: '1.0.0',
        description: '',
        commands: [],
        category: 'Other',
        installed_at: new Date().toISOString(),
        used_by_bots: []
      };
      
      if (fs.existsSync(skillJsonPath)) {
        try {
          const skillJson = JSON.parse(fs.readFileSync(skillJsonPath, 'utf8'));
          skillData = {
            ...skillData,
            name: skillJson.name || entry.name,
            version: skillJson.version || '1.0.0',
            description: skillJson.description || '',
            commands: extractCommands(skillJson),
            category: categorizeSkill(skillJson.name || entry.name)
          };
        } catch (err) {
          console.warn(`Failed to parse skill.json for ${entry.name}:`, err.message);
        }
      }
      
      // Check if skill already exists
      const { data: existing } = await supabaseRequest(
        'skills',
        'GET',
        null,
        `?business_id=eq.${businessId}&name=eq.${encodeURIComponent(skillData.name)}`
      );
      
      if (existing && existing.length > 0) {
        // Update existing skill
        await supabaseRequest(
          'skills',
          'PATCH',
          {
            version: skillData.version,
            description: skillData.description,
            commands: skillData.commands,
            category: skillData.category
          },
          `?id=eq.${existing[0].id}`
        );
        console.log(`  ↻ Updated skill: ${skillData.name}`);
      } else {
        // Create new skill
        await supabaseRequest('skills', 'POST', {
          business_id: businessId,
          ...skillData
        });
        console.log(`  + Added skill: ${skillData.name}`);
        
        // Log the activity
        await logActivity(
          businessId,
          'add',
          'skill',
          skillData.name,
          { version: skillData.version, category: skillData.category }
        );
      }
      
      skills.push(skillData);
    }
  }
  
  console.log(`✓ Synced ${skills.length} skills`);
  return { count: skills.length, skills };
}

/**
 * Sync bots to Supabase
 */
async function syncBots(businessId, businessName) {
  console.log('\n--- Syncing Bots ---');
  
  // For now, create a default bot if none exist
  const { data: existingBots } = await supabaseRequest(
    'bots',
    'GET',
    null,
    `?business_id=eq.${businessId}`
  );
  
  if (existingBots && existingBots.length > 0) {
    console.log(`Found ${existingBots.length} existing bots`);
    return { count: existingBots.length, bots: existingBots };
  }
  
  // Create a default bot
  const defaultBot = {
    business_id: businessId,
    name: `${businessName} Assistant`,
    model: 'gpt-4',
    purpose: 'General purpose assistant',
    status: 'active',
    config: {}
  };
  
  const { data: newBot, error } = await supabaseRequest('bots', 'POST', defaultBot);
  
  if (error) {
    console.error('Failed to create default bot:', error);
    return { count: 0, bots: [] };
  }
  
  console.log(`✓ Created default bot: ${defaultBot.name}`);
  
  // Log the activity
  await logActivity(
    businessId,
    'add',
    'bot',
    defaultBot.name,
    { model: defaultBot.model, purpose: defaultBot.purpose }
  );
  
  return { count: 1, bots: [newBot[0]] };
}

/**
 * Sync APIs to Supabase
 */
async function syncApis(businessId) {
  console.log('\n--- Syncing APIs ---');
  
  // For now, create default API configs
  const defaultApis = [
    { name: 'OpenAI API', provider: 'OpenAI', key_masked: '••••••••' },
    { name: 'Supabase API', provider: 'Supabase', key_masked: '••••••••' }
  ];
  
  const apis = [];
  
  for (const apiData of defaultApis) {
    // Check if API already exists
    const { data: existing } = await supabaseRequest(
      'apis',
      'GET',
      null,
      `?business_id=eq.${businessId}&name=eq.${encodeURIComponent(apiData.name)}`
    );
    
    if (existing && existing.length > 0) {
      console.log(`  ↻ API already exists: ${apiData.name}`);
      apis.push(existing[0]);
    } else {
      const { data: newApi, error } = await supabaseRequest('apis', 'POST', {
        business_id: businessId,
        name: apiData.name,
        provider: apiData.provider,
        key_masked: apiData.key_masked,
        status: 'active',
        used_by_skills: [],
        used_by_bots: []
      });
      
      if (error) {
        console.error(`Failed to create API ${apiData.name}:`, error);
      } else {
        console.log(`  + Added API: ${apiData.name}`);
        apis.push(newApi[0]);
        
        // Log the activity
        await logActivity(
          businessId,
          'add',
          'api',
          apiData.name,
          { provider: apiData.provider }
        );
      }
    }
  }
  
  console.log(`✓ Synced ${apis.length} APIs`);
  return { count: apis.length, apis };
}

/**
 * Extract commands from skill.json
 */
function extractCommands(skillJson) {
  const commands = [];
  
  if (skillJson.commands) {
    return skillJson.commands;
  }
  
  if (skillJson.functions) {
    for (const func of skillJson.functions) {
      commands.push(func.name);
    }
  }
  
  if (skillJson.tools) {
    for (const tool of skillJson.tools) {
      commands.push(tool.name || tool.function?.name);
    }
  }
  
  return commands.filter(Boolean);
}

/**
 * Categorize a skill based on its name
 */
function categorizeSkill(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('ai') || lowerName.includes('ml') || lowerName.includes('model')) {
    return 'AI/ML';
  }
  if (lowerName.includes('mail') || lowerName.includes('message') || lowerName.includes('chat')) {
    return 'Communication';
  }
  if (lowerName.includes('data') || lowerName.includes('database') || lowerName.includes('storage')) {
    return 'Data';
  }
  if (lowerName.includes('dev') || lowerName.includes('code') || lowerName.includes('build')) {
    return 'Development';
  }
  if (lowerName.includes('api') || lowerName.includes('integration') || lowerName.includes('connect')) {
    return 'Integration';
  }
  if (lowerName.includes('media') || lowerName.includes('image') || lowerName.includes('video') || lowerName.includes('audio')) {
    return 'Media';
  }
  if (lowerName.includes('productivity') || lowerName.includes('task') || lowerName.includes('schedule')) {
    return 'Productivity';
  }
  if (lowerName.includes('search') || lowerName.includes('find') || lowerName.includes('query')) {
    return 'Search';
  }
  if (lowerName.includes('security') || lowerName.includes('auth') || lowerName.includes('protect')) {
    return 'Security';
  }
  
  return 'Other';
}

/**
 * Main sync function
 */
async function sync(businessName) {
  console.log('========================================');
  console.log('OpenClaw Dashboard Sync with Activity Log');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  try {
    // Get or create business
    const business = await getOrCreateBusiness(businessName);
    const businessId = business.id;
    
    // Sync skills
    const skillsResult = await syncSkills(businessId);
    
    // Sync bots
    const botsResult = await syncBots(businessId, businessName);
    
    // Sync APIs
    const apisResult = await syncApis(businessId);
    
    // Log the overall sync activity
    await logActivity(
      businessId,
      'sync',
      'business',
      businessName,
      {
        bots: botsResult.count,
        skills: skillsResult.count,
        apis: apisResult.count,
        message: `Synced ${botsResult.count} bots, ${skillsResult.count} skills, ${apisResult.count} APIs`
      }
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n========================================');
    console.log('Sync Complete!');
    console.log('========================================');
    console.log(`Business: ${businessName}`);
    console.log(`Business ID: ${businessId}`);
    console.log(`Bots: ${botsResult.count}`);
    console.log(`Skills: ${skillsResult.count}`);
    console.log(`APIs: ${apisResult.count}`);
    console.log(`Duration: ${duration}s`);
    console.log('========================================');
    
    return {
      success: true,
      businessId,
      businessName,
      stats: {
        bots: botsResult.count,
        skills: skillsResult.count,
        apis: apisResult.count
      }
    };
    
  } catch (err) {
    console.error('\n❌ Sync failed:', err.message);
    
    // Try to log the failure if we have a businessId
    try {
      const business = await getOrCreateBusiness(businessName);
      await logActivity(
        business.id,
        'sync',
        'business',
        businessName,
        { error: err.message },
        'failed'
      );
    } catch (logErr) {
      console.error('Failed to log sync failure:', logErr.message);
    }
    
    return {
      success: false,
      error: err.message
    };
  }
}

// Export for use as a module
module.exports = {
  sync,
  logActivity,
  getOrCreateBusiness,
  syncSkills,
  syncBots,
  syncApis
};

// Run if called directly
if (require.main === module) {
  const businessName = process.argv[2] || 'Daken Software Builds CEO';
  sync(businessName).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
