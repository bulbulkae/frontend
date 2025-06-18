// ==UserScript==
// @name         Upwork Proposal → GitHub Issue + ProjectV2 Card (with duplicate check)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Creates GitHub issue from Upwork proposal, prevents duplicates, adds to ProjectV2 "To do" column.
// @author       No
// @match        https://www.upwork.com/nx/proposals/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log('SCRIPT IS ACTIVE');
  
    // === CONFIGURATION ===
    const REPOSITORY_ID = 'R_kgDOOygz_A';
    const REPO_OWNER = 'AinurMaxinum';
    const REPO_NAME = 'Upwork-proposals';
    const GITHUB_TOKEN = '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';
    const PROJECT_ID = 'PVT_kwHOCuJxNc4A6M21';
    const STATUS_FIELD_ID = 'PVTSSF_lAHOCuJxNc4A6M21zgu3WI0';
    const TODO_OPTION_ID = 'f75ad846';
  
    const CLIENT_FIELD_ID = 'PVTF_lAHOCuJxNc4A6M21zgu36Tk';
    const TOTAL_SPENT_FIELD_ID = 'PVTF_lAHOCuJxNc4A6M21zgu36XI';
    const PROJECT_LENGTH_FIELD_ID = 'PVTF_lAHOCuJxNc4A6M21zgu36ho';
    const FIXED_PR_HOURLY_RANGE_FIELD_ID = 'PVTF_lAHOCuJxNc4A6M21zgu36nE';
  
    const baseURL = 'https://www.upwork.com/nx/proposals/';
    const currentURL = window.location.href;
  
    if (!currentURL.startsWith(baseURL)) return;
  
    const proposalId = currentURL.replace(baseURL, '');
    if (!proposalId) return;
  
    // === Create Button ===
    const button = document.createElement('button');
    button.textContent = 'Add Proposal to GitHub To do';
    Object.assign(button.style, {
      position: 'fixed',
      top: '80px',
      right: '20px',
      padding: '12px 18px',
      backgroundColor: '#2ea44f',
      color: 'white',
      fontSize: '14px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      zIndex: '9999',
      boxShadow: '0 4px 6px rgba(32,33,36,0.28)',
    });
  
    document.body.appendChild(button);
    (async () => {
      const existingIssue = await findExistingIssueByProposalId(proposalId);
      if (existingIssue) {
        button.textContent = 'In git already Exists ⚠️';
        button.disabled = true;
      }
    })();
  
    button.addEventListener('click', async () => {
      button.disabled = true;
      button.textContent = 'Checking...';
  
      try {
        const titleEl = document.querySelector('h3.mb-6x.h5');
        let title = titleEl ? titleEl.innerText.trim() : `Proposal #${proposalId}`;
  
        const existingIssue = await findExistingIssueByProposalId(proposalId);
        if (existingIssue) {
          button.textContent = 'In git already Exists ⚠️';
          button.disabled = true;
          return;
        }
  
        const body = await issueBody(title);
  
        button.textContent = 'Creating...';
        const issue = await createIssue(REPOSITORY_ID, title, body, proposalId);
        const added = await addIssueToProject(issue.id, PROJECT_ID, STATUS_FIELD_ID, TODO_OPTION_ID);
  
        if (added) {
          alert('✅ GitHub issue created and added to To do column!');
          button.textContent = 'Done ✅';
        } else {
          throw new Error('Issue created but failed to add to project.');
        }
      } catch (error) {
        alert('❌ Error: ' + error.message);
        console.error('[GitHub Integration Error]', error);
        button.textContent = 'Try Again';
        button.disabled = false;
      }
    });
  
    const observer = new MutationObserver(() => {
      const featureList = document.querySelector('.fe-ui-job-features');
      const jobDescription = document.querySelector('[data-test="job-description-text"]');
      if (featureList && jobDescription) {
        observer.disconnect();
      }
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  
    async function findExistingIssueByProposalId(proposalId) {
      const query = `
        query SearchIssues($query: String!) {
          search(query: $query, type: ISSUE, first: 20) {
            nodes {
              ... on Issue {
                id
                title
                url
                body
                state
              }
            }
          }
        }
      `;
  
      const queryString = `repo:${REPO_OWNER}/${REPO_NAME} state:open sort:created-desc`;
      const data = await graphqlRequest(query, { query: queryString });
  
      return (
        data.search.nodes.find((issue) =>
          issue.body?.includes(`https://www.upwork.com/nx/proposals/${proposalId}`),
        ) || null
      );
    }
    async function getFullDescription() {
      const moreBtn = document.querySelector('.air3-truncation-btn');
      if (moreBtn) moreBtn.click();
  
      return new Promise((resolve) => {
        setTimeout(() => {
          const descEl = document.querySelector('.description.text-body-sm');
          let description = descEl ? descEl.innerText.trim() : 'No description available.';
  
          description = description.replace(/less\s*More\/Less about\s*$/i, '').trim();
          resolve(description);
        }, 300);
      });
    }
    async function extractFeatures() {
      const featureList = document.querySelector('.fe-ui-job-features');
  
      if (!featureList) return '';
  
      const features = Array.from(featureList.querySelectorAll('li')).map((li) => {
        const value = li.querySelector('strong')?.innerText.trim() || '';
        const label = li.querySelector('small')?.innerText.trim() || '';
        return `- **${label}**: ${value}`;
      });
  
      return features;
    }
    function clientProfile() {
      const paymentVerifiedEl = document.querySelector(
        'div.d-flex.align-items-center.mt-4 strong.text-light-on-muted',
      );
      const paymentVerified = paymentVerifiedEl?.textContent.includes('Payment method verified')
        ? '✅ Payment method verified'
        : '';
  
      const phoneVerifiedEl = document.querySelectorAll(
        'div.d-flex.align-items-center.mt-4 strong.text-light-on-muted',
      )[1];
      const phoneVerified = phoneVerifiedEl?.textContent.includes('Phone number verified')
        ? '✅ Phone number verified'
        : '';
  
      const clientNameEl = document.querySelector('div[data-qa="about-buyer-client-name"]');
      const clientName =
        clientNameEl?.querySelector('strong')?.textContent.trim() || 'Unknown Client';
  
      const buyerRatingEl = document.querySelector(
        'div[data-testid="buyer-rating"] .air3-rating-value-text',
      );
      const buyerRating = buyerRatingEl?.textContent.trim() || 'No rating';
  
      const ul = document.querySelector('ul.features.text-light-on-muted.list-unstyled.mt-4');
      const resultMarkdown = parseClientProfile(ul);
  
      const client = `### 📌 About the client
  
  ${paymentVerified || '❌ Payment not verified'}
  
  ${phoneVerified || '❌ Phone not verified'}
  
  #### ${clientName || 'Unnamed Client'}
  
  ${buyerRating || 0} reviews
  
  ${resultMarkdown || ''}
  `;
  
      return client;
    }
    function parseClientProfile(ulElement) {
      const liLocation = ulElement.querySelector('li[data-qa="client-location"]');
      const liLocation_country = liLocation?.querySelector('strong')?.textContent.trim() || '';
      const liLocation_city =
        liLocation?.querySelector('span.nowrap:nth-child(1)')?.textContent.trim() || '';
      const liLocation_localTime =
        liLocation?.querySelector('span.nowrap:nth-child(2)')?.textContent.trim() || '';
  
      const liJobStats = ulElement.querySelector('li[data-qa="client-job-posting-stats"]');
      const liJobStats_jobsPosted = liJobStats?.querySelector('strong')?.textContent.trim() || '';
      const liJobStats_hireRateAndOpenJobs =
        liJobStats?.querySelector('div')?.textContent.trim() || '';
  
      const liSpendAndHires = ulElement
        .querySelector('strong[data-qa="client-spend"]')
        ?.closest('li');
      const liSpend_totalSpent =
        liSpendAndHires?.querySelector('strong span span')?.textContent.trim() || '';
      const liSpend_hiresText =
        liSpendAndHires?.querySelector('div[data-qa="client-hires"]')?.textContent.trim() || '';
  
      const liCompany = ulElement.querySelector('li[data-qa="client-company-profile"]');
      const liCompany_industry =
        liCompany
          ?.querySelector('strong[data-qa="client-company-profile-industry"]')
          ?.textContent.trim() || '';
  
      const liMemberSince = ulElement.querySelector('li[data-qa="client-contract-date"]');
      const memberSince = liMemberSince?.querySelector('small')?.textContent.trim() || '';
  
      const output =
        liLocation_country +
        '\n' +
        liLocation_city +
        ' ' +
        liLocation_localTime +
        '\n' +
        '\n' +
        liJobStats_jobsPosted +
        '\n' +
        liJobStats_hireRateAndOpenJobs +
        '\n' +
        '\n' +
        (liSpend_totalSpent ? liSpend_totalSpent + ' total spent ' : '') +
        ' ' +
        liSpend_hiresText +
        '\n' +
        '\n' +
        liCompany_industry +
        '\n' +
        '\n' +
        memberSince;
  
      return `${output}`.trim();
    }
  
    async function issueBody(title) {
      const description = await getFullDescription();
      let features = await extractFeatures();
      features = features.length ? `\n\n### 📌 Job Features\n${features.join('\n')}` : '';
  
      const body = `### ${title}\n` + description + features + '\n' + clientProfile();
  
      return body;
    }
    async function createIssue(repositoryId, title, body, proposalId) {
      const query = `
          mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {
            createIssue(input: {
              repositoryId: $repositoryId,
              title: $title,
              body: $body,
            }) {
              issue {
                id
                number
                url
              }
            }
          }
        `;
      const variables = {
        repositoryId,
        title,
        body: `${body}\n\n[🔗 View Proposal](https://www.upwork.com/nx/proposals/${proposalId})`,
      };
  
      const data = await graphqlRequest(query, variables);
      return data.createIssue.issue;
    }
    async function graphqlRequest(query, variables) {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });
  
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map((err) => err.message).join(', '));
      }
  
      return result.data;
    }
    async function addIssueToProject(issueId, projectId, statusFieldId, todoOptionId) {
      const addItemMutation = `
          mutation AddProjectV2Item($projectId: ID!, $contentId: ID!) {
            addProjectV2ItemById(input: {
              projectId: $projectId,
              contentId: $contentId
            }) {
              item {
                id
              }
            }
          }
        `;
  
      const itemData = await graphqlRequest(addItemMutation, {
        projectId,
        contentId: issueId,
      });
  
      const projectItemId = itemData.addProjectV2ItemById.item.id;
  
      const updateFieldMutation = `
          mutation UpdateProjectV2ItemField(
            $projectId: ID!,
            $itemId: ID!,
            $fieldId: ID!,
            $value: ProjectV2FieldValue!
          ) {
            updateProjectV2ItemFieldValue(input: {
              projectId: $projectId,
              itemId: $itemId,
              fieldId: $fieldId,
              value: $value
            }) {
              projectV2Item {
                id
              }
            }
          }
        `;
  
      const value = {
        singleSelectOptionId: todoOptionId,
      };
  
      await graphqlRequest(updateFieldMutation, {
        projectId,
        itemId: projectItemId,
        fieldId: statusFieldId,
        value,
      });
  
      //_____________________________________
      const clientNameEl = document.querySelector('div[data-qa="about-buyer-client-name"]');
      let clientName =
        clientNameEl?.querySelector('strong')?.textContent.trim() || 'Unknown Client';
      clientName = ' 🧑‍💼 ' + clientName;
  
      const ul = document.querySelector('ul.features.text-light-on-muted.list-unstyled.mt-4');
      const liSpendAndHires = ul.querySelector('strong[data-qa="client-spend"]')?.closest('li');
      const liSpend_totalSpent =
        liSpendAndHires?.querySelector('strong span span')?.textContent.trim() || '';
  
      const featuresInTitle = await extractFeatures();
      let hourlyOrFixed = '';
      const match = featuresInTitle.find((f) => f.includes('Fixed-price'));
      if (match) {
        hourlyOrFixed = ' 💰 ' + match.replace(/- \*\*Fixed-price\*\*: /, '');
      }
  
      const match2 = featuresInTitle.find((f) => f.includes('Hourly range'));
      if (match2) {
        hourlyOrFixed = ' 🕒 ' + match2.replace(/- \*\*Hourly range\*\*: /, '');
      }
  
      let project_length = '';
      const match3 = featuresInTitle.find((f) => f.includes('Project length'));
      if (match2) {
        project_length = ' ⏳ ' + match3.replace(/- \*\*Project length\*\*: /, '');
      }
      //_____________________________________
  
      await setTextFieldValue(projectId, projectItemId, CLIENT_FIELD_ID, clientName);
      liSpend_totalSpent
        ? await setTextFieldValue(
            projectId,
            projectItemId,
            TOTAL_SPENT_FIELD_ID,
            ' 📉 ' + liSpend_totalSpent,
          )
        : '';
      hourlyOrFixed
        ? await setTextFieldValue(
            projectId,
            projectItemId,
            FIXED_PR_HOURLY_RANGE_FIELD_ID,
            ' ' + hourlyOrFixed,
          )
        : '';
      project_length
        ? await setTextFieldValue(
            projectId,
            projectItemId,
            PROJECT_LENGTH_FIELD_ID,
            ' ' + project_length,
          )
        : '';
  
      return true;
    }
  
    async function setTextFieldValue(projectId, itemId, fieldId, textValue) {
      const mutation = `
            mutation SetTextFieldValue {
              updateProjectV2ItemFieldValue(input: {
                projectId: "${projectId}",
                itemId: "${itemId}",
                fieldId: "${fieldId}",
                value: { text: "${textValue.replace(/"/g, '\\"')}" }
              }) {
                projectV2Item {
                  id
                }
              }
            }
          `;
  
      await graphqlRequest(mutation);
    }
  })();
  