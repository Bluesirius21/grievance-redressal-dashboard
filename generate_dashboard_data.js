const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function processData() {
  console.log('Starting data aggregation from india_states_dashboard_data.json...');
  const startTime = Date.now();

  const fileStream = fs.createReadStream('india_states_dashboard_data.json');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const stateStats = {};
  let inUserData = false;
  let currentUser = {};
  let userCount = 0;

  for await (const line of rl) {
    const trimmed = line.trim();

    if (trimmed.startsWith('"user_data": [')) {
      inUserData = true;
      continue;
    }

    if (inUserData) {
      if (trimmed.startsWith('"overall_data": [')) {
        break; // user_data section is finished
      }

      if (trimmed.startsWith('{')) {
        currentUser = {};
      } else if (trimmed.startsWith('}') || trimmed.startsWith('},')) {
        // Process collected user
        const state = currentUser['State Name'];
        if (state && state !== '---Select State---' && state !== 'Not Known') {
          if (!stateStats[state]) {
            stateStats[state] = {
              total_users: 0,
              male_count: 0,
              female_count: 0,
              trans_count: 0,
              districts: {},
              monthly_trends: {}
            };
          }

          const st = stateStats[state];
          st.total_users++;

          const gender = (currentUser['Gender'] || '').toUpperCase();
          if (gender === 'M') st.male_count++;
          else if (gender === 'F') st.female_count++;
          else st.trans_count++;

          // Date of Registration e.g. "03/11/2017" or "YYYY-MM-DD"
          const dateStr = currentUser['Date of Registration'];
          if (dateStr) {
            let yearMonth = null;
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                // DD/MM/YYYY
                const day = parts[0];
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                if (year && month && year.length === 4) {
                  yearMonth = `${year}-${month}`;
                }
              }
            } else if (dateStr.includes('-')) {
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                yearMonth = `${parts[0]}-${parts[1].padStart(2, '0')}`;
              }
            }
            if (yearMonth) {
              st.monthly_trends[yearMonth] = (st.monthly_trends[yearMonth] || 0) + 1;
            }
          }

          // District
          const district = currentUser['District Name'];
          if (district && district !== 'Not Known' && district !== '---Select District---') {
            st.districts[district] = (st.districts[district] || 0) + 1;
          }

          userCount++;
          if (userCount % 100000 === 0) {
            console.log(`Processed ${userCount} users...`);
          }
        }
        currentUser = {};
      } else {
        // Parse key-value line
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > -1) {
          const keyMatch = trimmed.slice(0, colonIdx).match(/"([^"]+)"/);
          if (keyMatch) {
            const key = keyMatch[1];
            let val = trimmed.slice(colonIdx + 1).trim();
            if (val.endsWith(',')) val = val.slice(0, -1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            currentUser[key] = val;
          }
        }
      }
    }
  }

  console.log(`Finished processing ${userCount} valid users across ${Object.keys(stateStats).length} states.`);

  // Calculate ranks
  const sortedStates = Object.keys(stateStats).sort((a, b) => stateStats[b].total_users - stateStats[a].total_users);

  const finalOutput = {};

  sortedStates.forEach((state, index) => {
    const raw = stateStats[state];
    const total = raw.total_users;
    const pct_male = total > 0 ? Number(((raw.male_count / total) * 100).toFixed(1)) : 0;
    const pct_female = total > 0 ? Number(((raw.female_count / total) * 100).toFixed(1)) : 0;

    // Sort monthly trend chronologically
    const monthly_trend = Object.keys(raw.monthly_trends)
      .sort()
      .map(ym => ({
        year_month: ym,
        registrations: raw.monthly_trends[ym]
      }));

    // Top districts (top 10)
    const top_districts = Object.keys(raw.districts)
      .sort((a, b) => raw.districts[b] - raw.districts[a])
      .slice(0, 10)
      .map(dist => ({
        "District Name": dist,
        "total_users": raw.districts[dist]
      }));

    finalOutput[state] = {
      total_users: total,
      pct_female: pct_female,
      pct_male: pct_male,
      national_rank: index + 1,
      monthly_trend: monthly_trend,
      top_districts: top_districts
    };
  });

  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
  }

  const outputPath = path.join('public', 'india_states_dashboard_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log(`Dashboard data saved to ${outputPath}! File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
  console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log('Sample Maharashtra entry:', JSON.stringify(finalOutput['Maharashtra'], null, 2));
}

processData().catch(err => {
  console.error('Error generating data:', err);
});
